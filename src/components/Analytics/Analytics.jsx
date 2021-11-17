import React, { useState, useEffect } from 'react'
import { TextAnalyticsClient, AzureKeyCredential } from '@azure/ai-text-analytics'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import './Analytics.css'

const Analytics = ({ text, lightMode }) => {
    const [textAnalytics, setTextAnalytics] = useState([])

    const textAnalyticsClient = new TextAnalyticsClient(
        process.env.REACT_APP_LANGUAGE_ENDPOINT,
        new AzureKeyCredential(process.env.REACT_APP_LANGUAGE_KEY));

    const entityRecognition = async (client, text) => {
        const entityInputs = [];

        if (text) {
            entityInputs.push(text);

            const entityResults = await client.recognizeEntities(entityInputs);

            // entityResults.forEach(document => {
            //     console.log(`Document ID: ${document.id}`);
            //     document.entities.forEach(entity => {
            //         console.log(`\tName: ${entity.text} \tCategory: ${entity.category} \tSubcategory: ${entity.subCategory ? entity.subCategory : "N/A"}`);
            //         console.log(`\tScore: ${entity.confidenceScore}`);
            //     });
            // });

            setTextAnalytics(entityResults)
        }
    }

    useEffect(() => {
        entityRecognition(textAnalyticsClient, text);
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
                    <b>{text ? text : "De la parole au texte!"}</b>
                    <hr style={{ backgroundColor: "black", width: "100%" }} />
                </div>
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
                                textAnalytics[0].entities.map((entity, id) => (
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
            </div >
        </div >
    )
}

export default Analytics
