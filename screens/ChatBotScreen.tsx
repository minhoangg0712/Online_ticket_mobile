import 'react-native-get-random-values';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView } from 'react-native';
import {
  getMessages,
  addUserMessage as serviceAddUserMessage,
  addBotMessage as serviceAddBotMessage,
  chat
} from '../services/chatbotService';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const flatListRef = useRef(null);

  const suggestedQuestions = [
    'Sự kiện nào đang được mở bán?',
    'Làm sao để mua vé?',
    'Tôi có thể thanh toán bằng phương thức nào?',
    'Sau khi mua vé xong tôi sẽ nhận được vé như thế nào?',
    'Tôi không nhận được vé thì phải làm sao?'
  ];

  useEffect(() => {
    (async () => {
      const savedMessages = await getMessages();
      if (savedMessages.length === 0) {
        const updatedMessages = await serviceAddBotMessage('Chào bạn! Mình là Eventa – trợ lý ảo luôn sẵn sàng hỗ trợ bạn 24/7');
        setMessages(updatedMessages);
      } else {
        setMessages(savedMessages);
      }
    })();
  }, []);

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const updatedMessages = await serviceAddUserMessage(userMessage.trim());
    setMessages(updatedMessages);
    setUserMessage('');
    setIsLoading(true);

    try {
      const res = await chat(userMessage.trim());
      const updatedMessagesAfterBot = await serviceAddBotMessage(res.reply);
      setMessages(updatedMessagesAfterBot);
    } catch (err) {
      const updatedMessagesAfterBot = await serviceAddBotMessage('Xin lỗi, hiện tại mình không thể trả lời.');
      setMessages(updatedMessagesAfterBot);
    }
    setIsLoading(false);
  };

  const sendSuggestedQuestion = (question) => {
    setUserMessage(question);
    sendMessage();
    setShowSuggestions(false);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.message, item.from === 'user' ? styles.userMessage : styles.botMessage]}>
      <Text style={{ color: item.from === 'user' ? '#fff' : '#000' }}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />

      {showSuggestions && (
        <View style={styles.suggestions}>
          {suggestedQuestions.map((q, idx) => (
            <TouchableOpacity key={idx} style={styles.suggestionBtn} onPress={() => sendSuggestedQuestion(q)}>
              <Text>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.suggestionToggleBtn}
          onPress={() => setShowSuggestions(prev => !prev)}
        >
          <Ionicons name="menu-outline" size={28} color="#FF7E42" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={userMessage}
          onChangeText={text => {
            setUserMessage(text);
            setShowSuggestions(text.trim() === '');
          }}
          placeholder="Nhập tin nhắn..."
        />

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={sendMessage}
        >
          <Text style={{ color: '#fff' }}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', padding: 10,
  },
  message: {
    padding: 10, marginVertical: 5, borderRadius: 10, maxWidth: '80%'
  },
  userMessage: {
    backgroundColor: '#FF7E42', alignSelf: 'flex-end'
  },
  botMessage: {
    backgroundColor: '#f1f1f1', alignSelf: 'flex-start'
  },
  suggestions: {
    padding: 10, backgroundColor: '#f9f9f9'
  },
  suggestionBtn: {
    padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginVertical: 3
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 5,
  },
  suggestionToggleBtn: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 10,
  },
  sendBtn: {
    backgroundColor: '#FF7E42',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
