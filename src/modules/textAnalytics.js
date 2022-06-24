//Methods for text Analytics

import axios from 'axios'
import { uuid } from 'uuidv4';

//Texte Translation (French to English)
export const translateText = async (text) => {
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
        return response.data[0].translations[0].text
    })
}

//Named Entity Recognition
export const entityRecognition = async (client, text) => {
    const entityInputs = []
    if (text) {
        entityInputs.push(text)
        const entityResults = await client.recognizeEntities(entityInputs)
        //setTextAnalytics(entityResults)

        let words = []

        entityResults.forEach(document => {
            document.entities.forEach(entity => {
                words.push(entity.text)
            });
        });
        return { entityResults, words }
    }
}

//Information Summarization
export const summarization_example = async (client, text) => {
    // let documents = [`La fonction de résumé extractif utilise des techniques de traitement du langage naturel pour localiser les phrases clés dans un document textuel non structuré. 
    // Ces phrases transmettent collectivement l'idée principale du document. Cette fonction est fournie sous forme d'API aux développeurs. 
    // Ils peuvent l'utiliser pour élaborer des solutions intelligentes basées sur les informations pertinentes extraites afin de prendre en charge divers cas d'utilisation. 
    // Dans l'aperçu public, le résumé extractif prend en charge plusieurs langues. Il est basé sur des modèles de transformation multilingues pré-entraînés, dans le cadre de notre quête de représentations holistiques. 
    // Il tire sa force de l'apprentissage par transfert à travers les langues monolingues et exploite la nature partagée des langues pour produire des modèles de qualité et d'efficacité améliorées.`];

    let documents = []

    documents.push(text)

    // console.log("== Analyze Sample For Extract Summary ==");

    // const actions = {
    //     extractSummaryActions: [{ modelVersion: "latest", orderBy: "Rank", maxSentenceCount: 5 }],
    // };
    // const poller = await client.beginAnalyzeActions(documents, actions, "en");

    const actions = {
        recognizeEntitiesActions: [{ modelVersion: "latest" }],
        recognizePiiEntitiesActions: [{ modelVersion: "latest" }],
        extractKeyPhrasesActions: [{ modelVersion: "latest" }],
        ExtractSummaryActions: [{ modelVersion: "latest" }]
    };
    const poller = await client.beginAnalyzeActions(documents, actions, "fr", {
        includeStatistics: true
    })

    poller.onProgress(() => {
        // console.log(
        //     `Number of actions still in progress: ${poller.getOperationState().actionsInProgressCount}`
        // );
    });

    // console.log(`The analyze actions operation created on ${poller.getOperationState().createdOn}`);

    // console.log(
    //     `The analyze actions operation results will expire on ${poller.getOperationState().expiresOn}`
    // );

    const resultPages = await poller.pollUntilDone();

    for await (const page of resultPages) {
        const keyPhrasesAction = page.extractKeyPhrasesResults[0];

        console.log(keyPhrasesAction.results)
        //await setResults(keyPhrasesAction.results)

        return keyPhrasesAction.results

        // keyPhrasesAction.results?.map((doc) => {
        //     console.log(`- Document ${doc.id}`)
        //     console.log("\tKey phrases:")
        //     doc.keyPhrases.map((phrase) => {
        //         console.log(`\t- ${phrase}`);
        //     })
        // })

        // if (!keyPhrasesAction.error) {
        //     for (const doc of keyPhrasesAction.results) {
        //         console.log(`- Document ${doc.id}`);
        //         if (!doc.error) {
        //             console.log("\tKey phrases:");
        //             for (const phrase of doc.keyPhrases) {
        //                 console.log(`\t- ${phrase}`);
        //             }
        //         } else {
        //             console.error("\tError:", doc.error);
        //         }
        //     }
        //     console.log("Action statistics: ");
        //     console.log(JSON.stringify(keyPhrasesAction.results.statistics));

        // }

        // const extractSummaryActionResult = page.extractSummaryActionResults[0]

        // console.log(extractSummaryActionResult)

        // const entitiesAction = page.recognizeEntitiesResults[0];
        // if (!entitiesAction.error) {
        //     for (const doc of entitiesAction.results) {
        //         console.log(`- Document ${doc.id}`);
        //         if (!doc.error) {
        //             console.log("\tEntities:");
        //             for (const entity of doc.entities) {
        //                 console.log(`\t- Entity ${entity.text} of type ${entity.category}`);
        //             }
        //         } else {
        //             console.error("\tError:", doc.error);
        //         }
        //     }
        //     console.log("Action statistics: ");
        //     console.log(JSON.stringify(entitiesAction.results.statistics));
        // }

        // const piiEntitiesAction = page.recognizePiiEntitiesResults[0];
        // if (!piiEntitiesAction.error) {
        //     for (const doc of piiEntitiesAction.results) {
        //         console.log(`- Document ${doc.id}`);
        //         if (!doc.error) {
        //             console.log("\tPii Entities:");
        //             for (const entity of doc.entities) {
        //                 console.log(`\t- Entity ${entity.text} of type ${entity.category}`);
        //             }
        //         } else {
        //             console.error("\tError:", doc.error);
        //         }
        //     }
        //     console.log("Action statistics: ");
        //     console.log(JSON.stringify(piiEntitiesAction.results.statistics));
        // }
    }
}

//Health Text Analytics
export const healthExample = async (client) => {
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
