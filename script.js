
let bluetoothDevice;
let bluetoothCharacteristic;

const serviceUUID = "12345678-1234-1234-1234-1234567890ab";
const characteristicUUID = "abcd1234-1234-1234-1234-abcdef123456";

const statusText = document.getElementById("status");
const speakBtn = document.getElementById("speakBtn");

// Speak using phone voice
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  speech.rate = 1;
  window.speechSynthesis.speak(speech);
}

// Connect to ESP32 using Bluetooth
async function connectBluetooth() {
  try {
    if (!navigator.bluetooth) {
      throw new Error("Open this app in Chrome using HTTPS.");
    }

    statusText.textContent = "Searching for JARVIS_CAR...";

    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: "JARVIS_CAR" }],
      optionalServices: [serviceUUID]
    });

    const server = await bluetoothDevice.gatt.connect();
    const service = await server.getPrimaryService(serviceUUID);

    bluetoothCharacteristic =
      await service.getCharacteristic(characteristicUUID);

    statusText.textContent = "ESP32 Connected!";
    speak("Robot connected successfully");

  } catch (error) {
    statusText.textContent = "Connection failed: " + error.message;
  }
}

// Send command to ESP32
async function sendCommand(command) {
  if (!bluetoothCharacteristic) {
    statusText.textContent = "Connect the robot first!";
    speak("Please connect the robot first");
    return;
  }

  try {
    await bluetoothCharacteristic.writeValue(
      new TextEncoder().encode(command)
    );
    statusText.textContent = "Command sent: " + command;
  } catch (error) {
    statusText.textContent = "Command failed";
  }
}

// Voice recognition
function startListening() {
  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!Recognition) {
    statusText.textContent = "Voice recognition is not supported.";
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "en-IN";

  recognition.onresult = function(event) {
    const command =
      event.results[0][0].transcript.toLowerCase();

    statusText.textContent = "You said: " + command;

    if (command.includes("connect")) {
      connectBluetooth();
    } else if (command.includes("forward")) {
      sendCommand("F");
    } else if (command.includes("backward")) {
      sendCommand("B");
    } else if (command.includes("left")) {
      sendCommand("L");
    } else if (command.includes("right")) {
      sendCommand("R");
    } else if (command.includes("stop")) {
      sendCommand("S");
    } else {
      speak("I heard you. Please give a robot command.");
    }
  };

  recognition.start();
}

speakBtn.addEventListener("click", startListening);

// Add Bluetooth connection button
const connectBtn = document.createElement("button");
connectBtn.textContent = "🔵 Connect Robot";
connectBtn.onclick = connectBluetooth;
document.querySelector(".container").appendChild(connectBtn);
