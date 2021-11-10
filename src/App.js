import { useState } from 'react';
import './App.css';
import { Container, Switch, withStyles } from '@material-ui/core'
import Header from './components/Header/Header';
import { grey } from '@material-ui/core/colors';


function App() {
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("fr-FR")
  const [lightMode, setLightMode] = useState(false)

  const ThemeSwitch = withStyles({
    switchBase: {
      color: grey[300],
      '&$checked': {
        color: grey[500],
      },
      '&$checked + $track': {
        backgroundColor: grey[500],
      },
    },
    checked: {},
    track: {},
  })(Switch);

  return (
    <div
      className="App"
      style={{
        height: "100vh",
        backgroundColor: lightMode ? "#fff" : "#282c34",
        color: lightMode ? "#000" : "#fff",
        transition: "all 0.5s linear"
      }}
    >
      <Container
        maxWidth='md'
        style={{ display: "flex", flexDirection: "column", height: "100vh", justifyContent: "space-evenly" }}
      >
        <div style={{ position: "absolute", top: "0", right: "15px", paddingTop: "10" }}>
          <span>{lightMode ? "Dark" : "Light"} Mode</span>
          <ThemeSwitch checked={lightMode} onChange={() => setLightMode(!lightMode)} />
        </div>
        <Header
          language={language} setLanguage={setLanguage}
          text={text} setText={setText}
          lightMode={lightMode}
        />
      </Container>
    </div >
  );
}

export default App;
