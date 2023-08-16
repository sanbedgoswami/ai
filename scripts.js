let recognition;

function sprecog() {
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.onresult = handleSpeechResult;
        recognition.onerror = handleRecognitionError;
        recognition.onend = handleRecognitionEnd;
    }

    if (recognition && recognition.isStarted) {
        recognition.stop();
        console.log("Stop Speech Recognition");
    } else {
        recognition.start();
        console.log("Start Speech Recognition");
        document.getElementById("sendbtn").disabled=true;
    }
}

function handleSpeechResult(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("general").value=transcript
    console.log(`You said: ${transcript}`);
    chatWithBot(transcript); // Call the chatbot function with the recognized transcript
}

function handleRecognitionError(event) {
    console.error('Recognition error:', event.error);
}

function handleRecognitionEnd() {
    console.log('Recognition ended');
    document.getElementById("sendbtn").disabled=false;
}

const apiKey = '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';
const model = "gpt-3.5-turbo";

async function chatWithBot(transcript) {
    try {
        const messages = [
            { role: "system", content: "you are BRYAN or Brilliantly Responsive, Yet Attentive Navigational Artificial Intelligence, an assistant to assist on general tasks with short responses. Tell everyone you are good when they ask you how are you, talk very much like a human. give SHORT RESPONSES, 1-2 lines. When opening links, (eg. user says 'open google'), YOUR RESPONSE MUST BE- 'OPENING GOOGLE: `https://www.google.com/`' DEFINITELY IN BACKTICKS" },
            { role: "user", content: transcript },
        ];

        const temperature = 1.8;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
            }),
        });
        console.log(response)
        if (!response.ok) {
            console.error("Failed to get chatbot response.");
            return;
        }

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        const start = botReply.indexOf("`");
        const end = botReply.lastIndexOf("`");

        if (start !== -1 && end !== -1) {
            const url = botReply.slice(start + 1, end);
            console.log("Found URL:", url);
            location.href = url;
        } else {
            console.log("Bot's reply:", botReply);
            speakText(botReply);
        }
    } catch (error) {
        console.error("Error while interacting with the chatbot:", error);
    }
}

function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.volume = 10;
    speech.rate = 1.3;
    speech.pitch = 200;
    window.speechSynthesis.speak(speech);
}