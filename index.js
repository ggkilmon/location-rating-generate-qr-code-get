exports.handler = async function(event, context) {
    console.log("Event: \n" + JSON.stringify(event, null, 2));
    return context;
}