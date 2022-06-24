import { useState } from 'react';
import './App.css';
import { Container, Switch, withStyles } from '@material-ui/core'
import { grey } from '@material-ui/core/colors';

import Header from './components/Header/Header';
import Analytics from './components/Analytics/Analytics'


function App() {
  const [text, setText] = useState("J'ai de la fiévre et des maux de tếte, je dois prendre Paracétamol.")
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
          language={language}
          setText={setText}
          lightMode={lightMode}
        />
        <Analytics text={text} lightMode={lightMode} />
      </Container>
    </div >
  );
}

export default App;
