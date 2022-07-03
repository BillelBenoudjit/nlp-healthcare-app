import { createTheme, ThemeProvider } from '@material-ui/core'
import React from 'react'
import MicIcon from '@material-ui/icons/Mic';
import Grid from '@mui/material/Grid'
import Input from '@mui/material/Input';
import { SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason } from 'microsoft-cognitiveservices-speech-sdk'
import './Header.css'

const Header = ({ language, setText, text, lightMode }) => {
    const darkTheme = createTheme({
        palette: {
            primary: {
                main: lightMode ? '#000' : '#fff'
            },
            type: lightMode ? 'light' : 'dark',
        },
    });

    const sttFromMic = async () => {
        const speechConfig = SpeechConfig.fromSubscription(process.env.REACT_APP_SPEECH_KEY, process.env.REACT_APP_SPEECH_REGION)
        speechConfig.speechRecognitionLanguage = language

        const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

        alert(language === 'en' ? 'Speak into your microphone in English...' : 'Parlez dans votre microphone en Français...')

        recognizer.recognizeOnceAsync(result => {
            let text;
            if (result.reason === ResultReason.RecognizedSpeech) {
                text = result.text.replace('.', "")
            } else {
                alert('ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.')
                text = '';
            }
            setText(text)
        });
    }

    const onTextChange = e => {
        setText(e.target.value)
    }

    return (
        <div className="header">
            <div className="inputs">
                <ThemeProvider theme={darkTheme}>
                    <Grid container spacing={3}>
                        {/* <Grid item xs={2}>
                            <img src={
                                require("./../../assets/azure.png")
                            } />
                        </Grid> */}
                        <Grid item xs={3}>
                            <MicIcon className="mic" onClick={() => { sttFromMic() }} />
                        </Grid>
                        <Grid item xs={3}>
                            <h3 className="select">
                                Parler pour obtenir votre texte.
                            </h3>
                        </Grid>
                        <Grid item xs={6}>
                            <h3 className="select">
                                Ou écrire pour obtenir votre texte.
                            </h3>
                            <Input className="select"
                                multiline
                                maxRows={4}
                                color={"primary"}
                                onChange={(e) => { onTextChange(e) }}
                            />
                        </Grid>
                    </Grid>

                    <br></br>

                </ThemeProvider>
            </div>
        </div>
    )
}

export default Header
