(async () => {
    try {
        const fs = require('fs');
        const res1 = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hello, I think someone is trying to scam me.", regionCode: "IN", sessionId: "test-chat-123" })
        });
        const data1 = await res1.json();

        const res2 = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "They are threatening to share my morphed images. What should I do? Tell me the portal.", regionCode: "IN", sessionId: "test-chat-123" })
        });
        const data2 = await res2.json();

        fs.writeFileSync('chat-test-results.json', JSON.stringify({
            turn1: data1.response,
            turn2: data2.response
        }, null, 2));

        console.log('Results saved to chat-test-results.json');
    } catch (e) {
        console.error(e);
    }
})();
