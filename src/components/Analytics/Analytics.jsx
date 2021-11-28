import React, { useState, useEffect } from 'react'
import { TextAnalyticsClient, AzureKeyCredential } from '@azure/ai-text-analytics'

import axios from 'axios'
import { uuid } from 'uuidv4';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Highlighter from "react-highlight-words";

import './Analytics.css'

const Analytics = ({ text, lightMode }) => {
    const [textAnalytics, setTextAnalytics] = useState([])
    const [translatedText, setTranslatedText] = useState("")
    const [textEntities, setTextEntities] = useState([])

    const textAnalyticsClient = new TextAnalyticsClient(
        process.env.REACT_APP_LANGUAGE_ENDPOINT,
        new AzureKeyCredential(process.env.REACT_APP_LANGUAGE_KEY))

    const translateText = async (text) => {
        await axios({
            baseURL: process.env.REACT_APP_TRANSLATOR_ENDPOINT,
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.REACT_APP_TRANSLATOR_KEY,
                'Ocp-Apim-Subscription-Region': process.env.REACT_APP_TRANSLATOR_REGION,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuid().toString()
            },
            params: {
                'api-version': '3.0',
                'from': 'fr',
                'to': ['en']
            },
            data: [{
                'text': text
            }],
            responseType: 'json'
        }).then(function (response) {
            console.log(response.data[0].translations[0].text);
            setTranslatedText(response.data[0].translations[0].text)
        })
    }

    const entityRecognition = async (client, text) => {
        const entityInputs = []
        if (text) {
            entityInputs.push(text)
            const entityResults = await client.recognizeEntities(entityInputs)
            setTextAnalytics(entityResults)

            let words = []

            entityResults.forEach(document => {
                document.entities.forEach(entity => {
                    words.push(entity.text)
                });
            });
            setTextEntities(words)
        }
    }

    const summarization_example = async (client) => {
        const documents = [`The extractive summarization feature uses natural language processing techniques to locate key sentences in an unstructured text document. 
            These sentences collectively convey the main idea of the document. This feature is provided as an API for developers. 
            They can use it to build intelligent solutions based on the relevant information extracted to support various use cases. 
            In the public preview, extractive summarization supports several languages. It is based on pretrained multilingual transformer models, part of our quest for holistic representations. 
            It draws its strength from transfer learning across monolingual and harness the shared nature of languages to produce models of improved quality and efficiency.`];

        console.log("== Analyze Sample For Extract Summary ==");

        // const actions = {
        //     extractSummaryActions: [{ modelVersion: "latest", orderBy: "Rank", maxSentenceCount: 5 }],
        // };
        // const poller = await client.beginAnalyzeActions(documents, actions, "en");

        const actions = {
            recognizeEntitiesActions: [{ modelVersion: "latest" }],
            recognizePiiEntitiesActions: [{ modelVersion: "latest" }],
            extractKeyPhrasesActions: [{ modelVersion: "latest" }]
        };
        const poller = await client.beginAnalyzeActions(documents, actions, "en", {
            includeStatistics: true
        })

        poller.onProgress(() => {
            console.log(
                `Number of actions still in progress: ${poller.getOperationState().actionsInProgressCount}`
            );
        });

        console.log(`The analyze actions operation created on ${poller.getOperationState().createdOn}`);

        console.log(
            `The analyze actions operation results will expire on ${poller.getOperationState().expiresOn}`
        );

        const resultPages = await poller.pollUntilDone();

        console.log(resultPages)

        for await (const page of resultPages) {
            const keyPhrasesAction = page.extractKeyPhrasesResults[0];
            if (!keyPhrasesAction.error) {
                for (const doc of keyPhrasesAction.results) {
                    console.log(`- Document ${doc.id}`);
                    if (!doc.error) {
                        console.log("\tKey phrases:");
                        for (const phrase of doc.keyPhrases) {
                            console.log(`\t- ${phrase}`);
                        }
                    } else {
                        console.error("\tError:", doc.error);
                    }
                }
                console.log("Action statistics: ");
                console.log(JSON.stringify(keyPhrasesAction.results.statistics));
            }

            const entitiesAction = page.recognizeEntitiesResults[0];
            if (!entitiesAction.error) {
                for (const doc of entitiesAction.results) {
                    console.log(`- Document ${doc.id}`);
                    if (!doc.error) {
                        console.log("\tEntities:");
                        for (const entity of doc.entities) {
                            console.log(`\t- Entity ${entity.text} of type ${entity.category}`);
                        }
                    } else {
                        console.error("\tError:", doc.error);
                    }
                }
                console.log("Action statistics: ");
                console.log(JSON.stringify(entitiesAction.results.statistics));
            }

            const piiEntitiesAction = page.recognizePiiEntitiesResults[0];
            if (!piiEntitiesAction.error) {
                for (const doc of piiEntitiesAction.results) {
                    console.log(`- Document ${doc.id}`);
                    if (!doc.error) {
                        console.log("\tPii Entities:");
                        for (const entity of doc.entities) {
                            console.log(`\t- Entity ${entity.text} of type ${entity.category}`);
                        }
                    } else {
                        console.error("\tError:", doc.error);
                    }
                }
                console.log("Action statistics: ");
                console.log(JSON.stringify(piiEntitiesAction.results.statistics));
            }
        }
    }

    const healthExample = async (client) => {
        console.log("== Recognize Healthcare Entities Sample ==");

        const documents = [
            "Prescribed 100mg ibuprofen, taken twice daily."
        ];

        const poller = await client.beginAnalyzeHealthcareEntities(documents, "en", {
            includeStatistics: true
        });

        console.log(documents)

        poller.onProgress(() => {
            console.log(
                `Last time the operation was updated was on: ${poller.getOperationState().lastModifiedOn}`
            );
        });
        console.log(
            `The analyze healthcare entities operation was created on ${poller.getOperationState().createdOn
            }`
        );
        console.log(
            `The analyze healthcare entities operation results will expire on ${poller.getOperationState().expiresOn
            }`
        );

        const results = await poller.pollUntilDone();

        for await (const result of results) {
            console.log(`- Document ${result.id}`);
            if (!result.error) {
                console.log("\tRecognized Entities:");
                for (const entity of result.entities) {
                    console.log(`\t- Entity "${entity.text}" of type ${entity.category}`);
                }
                if (result.entityRelations && (result.entityRelations.length > 0)) {
                    console.log(`\tRecognized relations between entities:`);
                    for (const relation of result.entityRelations) {
                        console.log(
                            `\t\t- Relation of type ${relation.relationType} found between the following entities:`
                        );
                        for (const role of relation.roles) {
                            console.log(`\t\t\t- "${role.entity.text}" with the role ${role.name}`);
                        }
                    }
                }
            } else console.error("\tError:", result.error);
        }
    }

    // summarization_example(textAnalyticsClient).catch((err) => {
    //     console.error("The sample encountered an error:", err);
    // });

    useEffect(() => {
        entityRecognition(textAnalyticsClient, text)
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
                {text ?
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
                                    <TableCell align="right">Categorie</TableCell>
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
                    : <br></br>
                }
            </div >
        </div >
    )
}

export default Analytics
