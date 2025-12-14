const MessageBubble = ({ from, text }) => {
  return (
    <div className={`message ${from}`}>
      {text}
    </div>
  );
};

export default MessageBubble;
