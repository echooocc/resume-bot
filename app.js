var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();

// Serve a static web page
server.get(/.*/, restify.serveStatic({
    'directory': '.',
    'default': 'index.html'
}));

server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Create bot global actions
//=========================================================

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });

//=========================================================
// Create bot  dialog
//=========================================================

bot.dialog('/', [
    function(session) {
        // Send a greeting and display main menu.
        var card = new builder.HeroCard(session)
            .title("Echo's Resume Bot")
            .text("Everything you need to know about Echo!")
            .images([
                builder.CardImage.create(session, "http://docs.botframework.com/images/demo_bot_image.png")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
        session.send("Hi! I am Echo's personal resume bot, I can show you more about Echo, and help you to schedule a meeting with the real Echo!");
        session.beginDialog('/help');
    },
    function(session, results) {
        // Display menu
        session.beginDialog('/menu');
    },
    function(session, results) {
        // Always say goodbye
        session.send("Byebye");
    }
]);


bot.dialog('/help', [
    function(session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);

bot.dialog('/menu', [
    function(session) {
        builder.Prompts.choice(session, "What you want know about Echo?", "experience|skillset|shedule|(quit)");
    },
    function(session, results) {
        if (results.response && results.response.entity == 'experience') {
            session.beginDialog("/experience", { company: "all" });
        } else if (results.response && results.response.entity == '(quit)') {
            // Exit the menu
            session.endDialog();
        } else {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        }
    },
    function(session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });


var experiences = {
    "all": {
        description: "Tell me more about Echo's Working Experience",
        commands: { Architech: "architech", Xe: "xe", CatchChat: "catchchat", Wifarer: "wifarer", Blackberry: "blackberry" }
    },
    "architech": {
        description: "Tell me more about Echo's Working Experience",
        commands: { Xe: "xe", CatchChat: "catchchat", Wifarer: "wifarer", Blackberry: "blackberry" }
    },
    "xe": {
        description: "Tell me more about Echo's Working Experience",
        commands: { Architech: "architech", CatchChat: "catchchat", Wifarer: "wifarer", Blackberry: "blackberry" }
    },
    "catchchat": {
        description: "Tell me more about Echo's Working Experience",
        commands: { Architech: "architech", Xe: "xe", Wifarer: "wifarer", Blackberry: "blackberry" }
    },
    "wifarer": {
        description: "Tell me more about Echo's Working Experience",
        commands: { Architech: "architech", Xe: "xe", CatchChat: "catchchat", Blackberry: "blackberry" }
    },
    "blackberry": {
        description: "Tell me more about Echo's Working Experience",
        commands: { Architech: "architech", Xe: "xe", CatchChat: "catchchat", Wifarer: "wifarer" }
    }
}

bot.dialog('/experience', [
    function(session, args) {
        var company = experiences[args.company];
        session.dialogData.commands = company.commands;
        builder.Prompts.choice(session, company.description, company.commands);
        // builder.Prompts.choice(session, "Tell me more about Echo's Working Experience", 'Architech|XE.com|CatchChat|Wifarer|Blackberry|(quit)');
    },
    function(session, results) {
        var destination = session.dialogData.commands[results.response.entity];
        session.replaceDialog("/experience", { company: destination });
    }

]);