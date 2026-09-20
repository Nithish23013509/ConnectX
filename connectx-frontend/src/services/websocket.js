import { Client } from "@stomp/stompjs";

let client = null;

export const connectWebSocket = (
    userId,
    onNotification
) => {

    client = new Client({

        brokerURL: "ws://localhost:8080/ws",

        reconnectDelay: 5000,

        onConnect: () => {

            console.log(
                "ConnectX WebSocket connected"
            );

            client.subscribe(
                `/topic/notifications/${userId}`,
                (message) => {

                    const notification =
                        JSON.parse(message.body);

                    onNotification(notification);
                }
            );
        },

        onStompError: (frame) => {

            console.error(
                "WebSocket error:",
                frame
            );
        }
    });

    client.activate();
};

export const disconnectWebSocket = () => {

    if (client) {
        client.deactivate();
        client = null;
    }
};
