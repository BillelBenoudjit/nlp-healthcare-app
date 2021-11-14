import React from 'react'
import './Analytics.css'

const Analytics = ({ text, lightMode }) => {
    return (
        <div>
            <div className="text">
                <div
                    className="singleMean"
                    style={{
                        backgroundColor: lightMode ? "#3B5360" : "#fff",
                        color: lightMode ? "#fff" : "#000",
                    }}
                >
                    <b>{text ? text : "De la parole au texte!"}</b>
                    <hr style={{ backgroundColor: "black", width: "100%" }} />
                </div>
            </div >
        </div>
    )
}

export default Analytics
