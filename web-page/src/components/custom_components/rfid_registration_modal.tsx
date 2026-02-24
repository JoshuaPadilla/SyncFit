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
import { CheckCircle2, Rss } from "lucide-react";
import { useEffect, useState } from "react";

interface RfidRegistrationModalProps {
	isOpen: boolean;

	memberName?: string;
	memberId: string;
	onConfirm: () => void;
}

export function RfidRegistrationModal({
	isOpen,
	memberName = "Alexander Thompson",
	onConfirm,
	memberId,
}: RfidRegistrationModalProps) {
	const client = useMqtt();

	// We keep scannedId local because it's a temporary hardware state
	const [scannedId, setScannedId] = useState<string | null>(null);

	const handleClose = () => {
		onConfirm();
		setScannedId(null);
	};

	const handleConfirm = () => {
		onConfirm();
		setScannedId(null);
	};

	useEffect(() => {
		if (!client) return;

		const topicToSubscribe = `rfid/registration/${memberId}`;

		client.subscribe(topicToSubscribe);

		client.on("message", (topic, message) => {
			if (topic === topicToSubscribe) {
				const stringMessage = message.toString("utf-8");
				console.log(stringMessage);

				const data = JSON.parse(stringMessage);
				setScannedId(data.data.uid);

				console.log(
					"Received MQTT message on topic ",
					topic,
					" with data ",
					data,
				);
			}
		});

		return () => {
			client.unsubscribe(topicToSubscribe);
		};
	}, [client]);

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

				<div className="flex flex-col items-center justify-center py-10">
					{/* Hardware Status Indicator */}
					<div className="relative mb-8">
						<div
							className={`p-8 rounded-full border-2 transition-all duration-500 ${
								scannedId
									? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
									: "border-zinc-700 animate-pulse"
							}`}
						>
							<Rss
								className={`h-12 w-12 ${scannedId ? "text-green-500" : "text-zinc-500"}`}
							/>
						</div>
						<span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 w-full text-center">
							{scannedId ? "Tag Captured" : "Ready to Scan"}
						</span>
					</div>

					{/* ID Display Box */}
					<div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 text-center">
						<p className="text-[10px] uppercase text-zinc-500 font-bold mb-2">
							Detected Hardware
						</p>
						<p
							className={`font-mono text-lg tracking-wider ${
								scannedId ? "text-green-400" : "text-zinc-600"
							}`}
						>
							{scannedId
								? `ID: ${scannedId}`
								: "ID: Waiting for scan..."}
						</p>
					</div>
				</div>

				<DialogFooter className="flex flex-col gap-3 sm:flex-col">
					<Button
						onClick={handleConfirm}
						disabled={!scannedId}
						className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 transition-all"
					>
						<CheckCircle2 className="mr-2 h-5 w-5" /> Confirm
					</Button>
					<Button
						variant="ghost"
						onClick={handleConfirm}
						className="text-zinc-500 hover:text-white hover:bg-zinc-900"
					>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
