import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useMqtt } from "@/context/mqtt_context";
import { useRfidStore } from "@/stores/rfidStore";
import { AlertCircle, CheckCircle2, ClockFading, Rss } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

interface RfidRegistrationModalProps {
	isOpen: boolean;
	memberName?: string;
	memberId: string;
	onClose: (scannedId: string | null) => void;
}

export function RfidRegistrationModal({
	isOpen,
	memberName = "Alexander Thompson",
	onClose,
	memberId,
}: RfidRegistrationModalProps) {
	const client = useMqtt();
	const { cancelRegistration, registerRfid } = useRfidStore();

	// Track the temporary hardware states
	const [loading, setLoading] = useState(false);
	const [scannedId, setScannedId] = useState<string | null>(null);
	const [scanStatus, setScanStatus] = useState<
		"idle" | "success" | "error" | "expired"
	>("idle");
	const [message, setMessage] = useState<string>("");

	const resetState = () => {
		setScannedId(null);
		setScanStatus("idle");
		setMessage("");
		setLoading(false);
	};

	const handleClose = async () => {
		try {
			setLoading(true);
			await cancelRegistration(); // Ensure backend state is reset
			onClose(scannedId); // Or an onClose() prop if you have one
		} finally {
			setLoading(false);
		}
	};

	const handleRetry = async () => {
		try {
			setLoading(true);
			resetState();
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!client) return;

		const topicToSubscribe = `rfid/registration/${memberId}`;

		// Define the handler function so we can reference it for removal
		const handleMessage = (topic: any, mqttMessage: any) => {
			if (topic === topicToSubscribe) {
				try {
					const stringMessage = mqttMessage.toString("utf-8");
					const parsed = JSON.parse(stringMessage);
					const payload = parsed.data || parsed;

					setScanStatus(payload.status);
					setMessage(payload.message || "");
					setScannedId(payload.uid || null);
				} catch (err) {
					console.error("Failed to parse MQTT message", err);
				}
			}
		};

		// 1. Subscribe
		client.subscribe(topicToSubscribe);

		// 2. Listen
		client.on("message", handleMessage);

		// 3. Cleanup (Crucial!)
		return () => {
			client.unsubscribe(topicToSubscribe);
			client.off("message", handleMessage); // This stops the leak
		};
	}, [client, memberId]);

	// Reset state whenever the modal is opened
	useEffect(() => {
		if (isOpen) {
			resetState();
		}
	}, [isOpen]);

	useEffect(() => {
		if (scanStatus === "success" || scanStatus === "expired") {
			const timer = setTimeout(() => {
				handleClose();
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [scanStatus]);

	// Derived UI states based on current scanStatus
	const isSuccess = scanStatus === "success";
	const isError = scanStatus === "error";
	const isExpired = scanStatus === "expired";

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[425px] bg-black text-white border-zinc-800">
				<DialogHeader>
					<DialogTitle className="text-center text-xl font-semibold">
						RFID Registration
					</DialogTitle>
					<DialogDescription className="text-center text-zinc-400">
						Assigning access for {memberName}
					</DialogDescription>
				</DialogHeader>

				{isExpired ? (
					<div className="flex flex-col items-center justify-center w-full text-lg text-zinc-500 py-8">
						<ClockFading />
						<span className="">Registration Timeout Expired</span>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-8">
						{/* Hardware Status Indicator */}
						<div className="relative mb-10 mt-4">
							<div
								className={`p-8 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
									isSuccess
										? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
										: isError
											? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
											: "border-zinc-700 animate-pulse"
								}`}
							>
								{isError ? (
									<AlertCircle className="h-12 w-12 text-red-500" />
								) : (
									<Rss
										className={`h-12 w-12 ${
											isSuccess
												? "text-green-500"
												: "text-zinc-500"
										}`}
									/>
								)}
							</div>
							<span
								className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] w-full text-center font-bold ${
									isSuccess
										? "text-green-500"
										: isError
											? "text-red-500"
											: "text-zinc-500"
								}`}
							>
								{isSuccess
									? "Tag Captured"
									: isError
										? "Scan Failed"
										: "Ready to Scan"}
							</span>
						</div>

						{/* ID Display Box */}
						<div className="w-full flex flex-col items-center justify-center">
							<div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 text-center mb-3">
								<p className="text-[10px] uppercase text-zinc-500 font-bold mb-2">
									Detected Hardware
								</p>
								<p
									className={`font-mono text-lg tracking-wider ${
										isSuccess
											? "text-green-400"
											: isError && scannedId
												? "text-red-400"
												: "text-zinc-600"
									}`}
								>
									{scannedId
										? `ID: ${scannedId}`
										: "ID: Waiting for scan..."}
								</p>
							</div>

							{/* Message Display Area */}
							<div className="h-6">
								{message && (
									<p
										className={`text-sm font-medium text-center transition-all ${
											isError
												? "text-red-400"
												: "text-green-400"
										}`}
									>
										{message}
									</p>
								)}
							</div>
						</div>
					</div>
				)}

				<DialogFooter className="flex flex-col gap-3 sm:flex-col">
					{isError && (
						<Button
							onClick={handleRetry}
							disabled={!isError}
							className={`w-full font-bold h-12 transition-all ${
								isError
									? "bg-red-600 hover:bg-red-700 text-white"
									: "bg-zinc-800 text-zinc-500 cursor-not-allowed"
							}`}
						>
							{}
							<CheckCircle2 className="mr-2 h-5 w-5" />
							retry
						</Button>
					)}
					{!scannedId && !isExpired && (
						<Button
							variant="ghost"
							onClick={handleClose}
							className="text-zinc-500 hover:text-white hover:bg-zinc-900"
						>
							{loading ? (
								<Spinner className="mr-2 h-5 w-5" />
							) : (
								"Cancel"
							)}
						</Button>
					)}
					{(scanStatus === "success" || isExpired) && (
						<div className="flex justify-center w-full text-sm text-zinc-500">
							<Spinner className="mr-2 h-5 w-5" /> Closing modal
							...
						</div>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
