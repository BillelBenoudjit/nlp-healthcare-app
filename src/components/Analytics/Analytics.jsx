import React, { useState, useEffect } from 'react'
import { TextAnalyticsClient, AzureKeyCredential } from '@azure/ai-text-analytics'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { entityRecognition, summarization_example, healthExample } from '../../modules/textAnalytics'

import Highlighter from "react-highlight-words";

import './Analytics.css'

const Analytics = ({ text, lightMode }) => {
    const [textAnalytics, setTextAnalytics] = useState([])
    const [textEntities, setTextEntities] = useState([])
    const [data, setData] = useState([])

    const textAnalyticsClient = new TextAnalyticsClient(
        process.env.REACT_APP_LANGUAGE_ENDPOINT,
        new AzureKeyCredential(process.env.REACT_APP_LANGUAGE_KEY))

    const linked_entities = async (client) => {
        const documents = [
            "Microsoft a été fondée par Bill Gates et Paul Allen.",
            "L'île de Pâques, territoire chilien, est une île volcanique isolée de Polynésie.",
            "J'utilise Azure Functions pour développer mon produit."
        ];

        const results = await client.recognizeLinkedEntities(documents, "en");

        for (const result of results) {
            if (result.error === undefined) {
                // console.log(" -- Recognized linked entities for input", result.id, "--");
                for (const entity of result.entities) {
                    // console.log(entity.name, "(URL:", entity.url, ", Source:", entity.dataSource, ")");
                    for (const match of entity.matches) {
                        // console.log(
                        //     "  Occurrence:",
                        //     '"' + match.text + '"',
                        //     "(Score:",
                        //     match.confidenceScore,
                        //     ")"
                        // );
                    }
                }
            } else {
                console.error("Encountered an error:", result.error);
            }
        }
    }

    linked_entities(textAnalyticsClient).catch((err) => {
        console.error("The Linked Entities encountered an error:", err)
    })


    // healthExample(textAnalyticsClient).catch((err) => {
    //     console.error("The sample encountered an error:", err)
    // })

    // summarization_example(textAnalyticsClient).catch((err) => {
    //     console.error("The sample encountered an error:", err);
    // });

    useEffect(async () => {
        setTextAnalytics([])
        setTextEntities([])
        setData([])
        let wrap = await entityRecognition(textAnalyticsClient, text)
        if (wrap) {
            setTextAnalytics(wrap.entityResults)
            setTextEntities(wrap.words)
            if (text) {
                let results = await summarization_example(textAnalyticsClient, text)
                let phrases = results[0].keyPhrases.map((phrase) => phrase)
                setData(phrases)
            }
        }
    }, [text])

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
                    <b>{text ? (<Highlighter
                        highlightClassName="YourHighlightClass"
                        searchWords={textEntities ? textEntities : []}
                        autoEscape={true}
                        textToHighlight={text}
                    />)
                        : "De la parole au texte!"}</b>
                    <hr style={{ backgroundColor: "black", width: "100%" }} />
                </div>
                <div>
                    {text ?
                        <>
                            <h3 className="select">
                                Named Entity Recognition
                            </h3>
                            <TableContainer
                                component={Paper}
                                style={{
                                    borderRadius: "10px"
                                }}
                            >
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell align="right">Texte</TableCell>
                                            <TableCell align="right">Catégorie</TableCell>
                                            <TableCell align="right">Sous catégorie</TableCell>
                                            <TableCell align="right">Score de confiance</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            textAnalytics[0]?.entities.map((entity, id) => (
                                                <TableRow
                                                    key={id}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        {textAnalytics[0].id}
                                                    </TableCell>
                                                    <TableCell align="right">{entity.text}</TableCell>
                                                    <TableCell align="right">{entity.category}</TableCell>
                                                    <TableCell align="right">{entity.subCategory ? entity.subCategory : "N/A"}</TableCell>
                                                    <TableCell align="right">{entity.confidenceScore}</TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                        : <br></br>
                    }
                </div>
                {text ?
                    <>
                        <h3 className="select">
                            Key phrases Extraction
                        </h3>
                        {data.length == 0 ?
                            <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                            :
                            <div
                                className="singleMean"
                                style={{
                                    backgroundColor: lightMode ? "#3B5360" : "#fff",
                                    color: lightMode ? "#fff" : "#000",
                                }}
                            >
                                {
                                    data.map((word) => {
                                        return (
                                            <li styles={{ fontWeight: 'bold' }}>{word}</li>
                                        )
                                    })
                                }
                                <hr style={{ backgroundColor: "black", width: "100%" }} />
                            </div>
                        }
                    </>
                    : <br></br>
                }
            </div >
        </div >
    )
}

export default Analytics
