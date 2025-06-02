import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AppButton from '@/components/Button';
import useSocket from '@/hooks/useSocket';
import { getUserRole } from '@/usableFunction/Session';

const { width } = Dimensions.get('window');
type ChatMessage = {
    roomId: string;
    message: string;
    userId?: string;
    timestamp: string;
};

export default function ChatScreen() {
    const { roomId } = useLocalSearchParams(); // get roomId param
    const [currentMessage, setCurrentMessage] = useState('');
    const [chats, setChats] = useState<ChatMessage[]>([]);
    const { socket, loading } = useSocket();
    const messagesEndRef = useRef<ScrollView>(null);
    const [role, setRole] = useState<string | null>(null);
    const fetchUserRole = async () => {
        try {
            const userRole = await getUserRole();
            console.log('Current user role:', userRole);
            setRole(userRole);
        } catch (err) {
            console.error('Error fetching user role:', err);
        }
    };
    useEffect(() => {
        fetchUserRole();
    }, []);

    useEffect(() => {

        if (socket && !loading && roomId) {
            // Join room on socket connect
            socket.emit('join_room', { roomId });

            // Listen for incoming messages
            const receiveMessageHandler = (message: ChatMessage) => {
                setChats((prev) => [...prev, message]);
                scrollToBottom();
            };


            socket.on('receive_message', receiveMessageHandler);

            socket.on('connect', () => {
                console.log('Connected with socket ID:', socket.id);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            // Cleanup listeners on unmount or socket change
            return () => {
                socket.off('receive_message', receiveMessageHandler);
                socket.off('connect');
                socket.off('disconnect');
            };
        }
    }, [socket, loading, roomId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollToEnd({ animated: true });
    };

    const roomIdStr = Array.isArray(roomId) ? roomId[0] : roomId;
    const sendMessage = () => {
        if (!currentMessage.trim() || !socket) return;

        const messageData: ChatMessage = {
            roomId: roomIdStr,
            message: currentMessage,
            userId: socket.id,
            timestamp: new Date().toISOString(),
        };

        socket.emit('send_message', messageData);
        setChats((prev) => [...prev, messageData]);
        setCurrentMessage('');
        scrollToBottom();
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                ref={messagesEndRef}
                onContentSizeChange={scrollToBottom}
            >
                {chats.map((chat, index) => {
                    const isMe = chat.userId === socket?.id;
                    return (
                        <View
                            key={index}
                            style={[
                                styles.messageRow,
                                isMe ? styles.messageRowEnd : styles.messageRowStart,
                            ]}
                        >
                            <View
                                style={[
                                    styles.messageBubble,
                                    isMe ? styles.myMessage : styles.otherMessage,
                                ]}
                            >
                                <Text style={styles.messageHeader}>
                                    {isMe ? 'You' : `User ${chat.userId?.substring(0, 5)}`}
                                </Text>
                                <Text
                                    style={[
                                        styles.messageText,
                                        isMe ? styles.myMessageText : styles.otherMessageText,
                                    ]}
                                >
                                    {chat.message}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={currentMessage}
                    onChangeText={setCurrentMessage}
                    placeholder="Type a message..."
                    placeholderTextColor="#9CA3AF"
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
                <AppButton
                    title="End Chat"
                    onPress={() => {
                        socket?.emit('leave_room', { roomId });
                        if (role === 'customer') {
                            router.push('/(root)/(rides)/VerifyOtpScreen');
                        } else if (role === 'rider') {
                            router.push('/(root)/(rides)/ViewOtpScreen');
                        }
                    }}
                />
            </View>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        maxWidth: Math.min(width, 448),
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    messagesContent: {
        padding: 16,
        gap: 8,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    messageRowEnd: {
        justifyContent: 'flex-end',
    },
    messageRowStart: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxWidth: '75%',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    myMessage: {
        backgroundColor: '#3B82F6',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        backgroundColor: '#D1D5DB',
        borderBottomLeftRadius: 4,
    },
    messageHeader: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 16,
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    otherMessageText: {
        color: '#000000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        gap: 8,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    sendButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
});
