const PriorityUse = {
    INPUT: 'input',
    GENERATED: 'generated',
}

function generateMessage() {
    return `feat  (aTH ) :GENERATED MESSAGE TITLE    
Experience pipline work my kysa package and check stages`;
}


function applyGenerator(result, context) {
    const rules = context.settings.main.generator;

    if (rules.enabled === false) return result;

const generatedMessage = generateMessage();

    return (rules.priorityUse === PriorityUse.INPUT ? result : ({
            ...result,
            generated: generatedMessage,
            normalized: generatedMessage,
            final: generatedMessage
        })
    )
}

module.exports = {
    applyGenerator
}
