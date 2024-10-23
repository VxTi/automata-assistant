/**
 * @fileoverview RegisteredTools.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 18 - 01:28
 */
import { Tool } from "llm";

export const RegisteredTools: Tool[] = [
    {
        type: 'function',
        function: {
            name: 'acquire_image',
            description: 'Return a prompt for generating an image. This image can be used for various purposes.',
            parameters: {
                type: 'object',
                properties: {
                    prompt: { type: 'string', description: 'The prompt for the image generation.' },
                    imageStyle: {
                        type: 'string',
                        description: 'The style of the image, can be either \'natural\' or \'vivid\''
                    }
                },
                required: [ 'prompt', 'imageStyle' ]
            }

        }
    },
    {
        type: 'function',
        function: {
            name: 'weather_query',
            description: 'Return the weather conditions at a specific location.',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'The location to get the weather from.'
                    },
                    unit: {
                        type: 'string',
                        enum: [ 'C', 'F' ],
                        description: 'The temperature unit to use. Infer this from the user\'s location.'
                    },
                    temperatureAmount: {
                        type: 'number',
                        description: 'The amount of temperature to display, given in the temperatureSymbol.'
                    },
                    weatherCondition: {
                        type: 'string',
                        description: 'The weather condition to display.'
                    }
                },
                required: [ 'location', 'unit', 'temperatureAmount', 'weatherCondition' ]
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'internet_query',
            description: 'Return an answer to a question based on information on the internet, if, and only if you do not have the knowledge to answer the question yourself.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'A URL-Encoded version of the question to ask the internet.'
                    }
                },
                required: [ 'question' ]
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'send_email',
            description: 'Send an email to a specific email address with either the previously given content, or ask for the content to send.',
            parameters: {
                type: 'object',
                properties: {
                    recipient: {
                        type: 'string',
                        description: 'The email address to send the email to.'
                    },
                    topic: {
                        type: 'string',
                        description: 'The topic of the email.'
                    },
                    body: {
                        type: 'string',
                        description: 'The body of the email.'
                    },
                    attachments: {
                        type: 'array',
                        items: {
                            type: 'string',
                            description: 'The attachment to add to the email.'
                        }
                    }
                },
                required: [ 'recipient', 'topic', 'body' ]
            }
        }
    }
];
