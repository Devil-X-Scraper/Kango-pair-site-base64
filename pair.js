const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');
const {
    default: Malvin_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require('@whiskeysockets/baileys');

// Function to remove temp session folder
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// Define multiple browser profiles for better connection
const browserOptions = [
    Browsers.macOS('Chrome'),
    Browsers.macOS('Safari'),
    Browsers.macOS('Edge'),
    Browsers.windows('Chrome'),
    Browsers.windows('Firefox'),
    Browsers.windows('Edge'),
    Browsers.ubuntu('Chrome'),
    Browsers.ubuntu('Firefox'),
];

// Pick a random browser each run
function getRandomBrowser() {
    return browserOptions[Math.floor(Math.random() * browserOptions.length)];
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    
    async function Malvin_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Pair_Code_By_Malvin_Tech = Malvin_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(
                        state.keys,
                        pino({ level: 'fatal' }).child({ level: 'fatal' })
                    ),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: getRandomBrowser(),
            });

            if (!Pair_Code_By_Malvin_Tech.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Malvin_Tech.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_Malvin_Tech.ev.on('creds.update', saveCreds);
            Pair_Code_By_Malvin_Tech.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    console.log('🔗 Connection opened, preparing session data...');
                    
                    // Increased delay to ensure full connection
                    await delay(3000);
                    
                    try {
                        let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                        await delay(1000);
                        let b64data = Buffer.from(data).toString('base64');
                        
                        // Get bot's own number properly
                        const botNumber = Pair_Code_By_Malvin_Tech.user.id.split(':')[0] + '@s.whatsapp.net';
                        
                        console.log('📤 Sending session data to:', botNumber);
                        
                        // Send session data FIRST
                        let session = await Pair_Code_By_Malvin_Tech.sendMessage(
                            botNumber, // CHANGED: Use bot's own number instead of user.id
                            { text: 'KANGO~' + b64data }
                        );

                        console.log('✅ Session data sent, sending welcome message...');

                        let Star_MD_TEXT = `*Hello there KANGO User! 👋🏻* 

> Do not share your session id with your gf 😂.

 *Thanks for using 👑 KANGO XMD 🚩* 

> Join WhatsApp Channel :- ⤵️
 
https://whatsapp.com/channel/0029Va8YUl50bIdtVMYnYd0E

Dont forget to fork the repo ⬇️

https://github.com/OfficialKango/KANGO-XMD-LITE

> *© Powered BY Hector Manuel 🖤*`;

                        // Send welcome message with proper formatting
                        await Pair_Code_By_Malvin_Tech.sendMessage(
                            botNumber, // CHANGED: Use bot's own number
                            { 
                                text: Star_MD_TEXT,
                                contextInfo: {
                                    forwardingScore: 1,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: '120363404284793169@newsletter',
                                        newsletterName: 'KANGO XMD',
                                        serverMessageId: -1
                                    }
                                }
                            },
                            { quoted: session }
                        );

                        console.log('✅ Welcome message sent successfully');
                        
                        // Give more time for messages to be delivered
                        await delay(2000);
                        
                    } catch (messageError) {
                        console.error('❌ Error sending messages:', messageError);
                        // Try to send error notification
                        try {
                            const botNumber = Pair_Code_By_Malvin_Tech.user.id.split(':')[0] + '@s.whatsapp.net';
                            await Pair_Code_By_Malvin_Tech.sendMessage(
                                botNumber,
                                { text: '❌ Failed to send session data automatically. Please check manually.' }
                            );
                        } catch (e) {
                            console.error('Failed to send error message:', e);
                        }
                    }
                    
                    // Close connection after sending messages
                    console.log('🔒 Closing connection...');
                    await Pair_Code_By_Malvin_Tech.ws.close();
                    
                    // Clean up temporary files
                    console.log('🧹 Cleaning up temporary files...');
                    await removeFile('./temp/' + id);
                    console.log('✅ Cleanup completed');
                    
                } else if (
                    connection === 'close' &&
                    lastDisconnect &&
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode != 401
                ) {
                    console.log('🔄 Connection closed, attempting reconnect...');
                    await delay(10000);
                    Malvin_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log('❌ Service error:', err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }
    
    return await Malvin_PAIR_CODE();
});

module.exports = router;
