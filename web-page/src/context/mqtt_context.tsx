import type { MqttClient } from "mqtt";
import mqtt from "mqtt";
import { createContext, useContext, useEffect, useState } from "react";

const MqttContext = createContext<MqttClient | null>(null);

export function MqttProvider({ children }: { children: React.ReactNode }) {
	const [client, setClient] = useState<MqttClient | null>(null);

	useEffect(() => {
		const mqttClient = mqtt.connect(import.meta.env.VITE_MQTT_BROKER_IP!, {
			username: import.meta.env.VITE_MQTT_USERNAME!,
			password: import.meta.env.VITE_MQTT_PASSWORD!,
		});

		mqttClient.on("connect", () => {
			setClient(mqttClient);
		});

		return () => {
			mqttClient.end();
		};
	}, []);

	return (
		<MqttContext.Provider value={client}>{children}</MqttContext.Provider>
	);
}

export function useMqtt() {
	return useContext(MqttContext);
}
