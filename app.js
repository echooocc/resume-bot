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

//temporary fix 3.4.0 TyperError of undefined path in DefaultLocalizer
var bot = new builder.UniversalBot(connector, {
    localizerSettings: {
        botLocalePath: "./locale",
        defaultLocale: "en"
    }
});
server.post('/api/messages', connector.listen());

//=========================================================
// Create bot global actions
//=========================================================

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^bye/i });

//=========================================================
// Create bot  dialog
//=========================================================

bot.dialog('/', [
    function(session) {
        // Send a greeting and display main menu.
        session.send("Hi! I am Echo's personal resume bot, I can show you more about Echo, and help you to schedule a meeting with the real Echo!");
        var card = new builder.HeroCard(session)
            .title("Echo's Resume Bot")
            .text("Everything you need to know about Echo!")
            .images([
                builder.CardImage.create(session, "http://docs.botframework.com/images/demo_bot_image.png")
            ])
            .buttons([
                builder.CardAction.dialogAction(session, "/experience", "experience", "Experience"),
                builder.CardAction.dialogAction(session, "/skillset", "skillset", "Skill Set"),
                builder.CardAction.dialogAction(session, "/shedule", "shedule", "Schedule A Meeting")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        // session.send(msg);
        session.beginDialog('/menu');
    }
]);

bot.dialog('/menu', [
    function(session) {
        builder.Prompts.choice(session, "What you want know about Echo?", { "Working Experience": "experience", "Schedule a Meeting": "schedule" }, { listStyle: builder.ListStyle["button"] });
    },
    function(session, results) {
        if (results.response && results.response.entity == 'Working Experience') {
            session.beginDialog("/experience", { experience: "all" });
        } else {
            session.beginDialog('/schedule');
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
        description: "Echo worked at Architech, a custom software engineering and design company, as a Web Developer. She helped in several projects with different clients by providing her web development expertise. She and her algie buddies made a distribution portal for Boars Head, and the service ss available for thousands users across America. She and her scrum buddys improved the PointClickCare’s health care cloud platform, which is used by the stuffs in several senior facilities across North America.",
        skillset: "JavaScript, Gulp, Vagrant, Sass, UIkit, Elasticsearch, dotCMS, Java, JUnit, SQL, Visualforce",
        commands: { More: "all" }
    },
    "xe": {
        description: "Echo worked at XE.com, the online foreign exchange provider, as a UX Developer. She invloved in the UX design and web development of the xe.com website, and many other marketing pages. She also helped to build the currency plugin using XE.com API for DuckDuckGo. She optimized and improved the accessibility for xe.com, which viewed by thousands of users per day, ranked by Alexa as the top 600 of all sites worldwide by traffic.",
        skillset: "PHP, JavaScript, HTML, Sass, AngularJs, NodeJs, Perl, Photoshop, Balsamiq mockup",
        commands: { More: "all" }
    },
    "catchchat": {
        description: "Echo worked as a web developer remotely for CatchChat, a Chinese version of snapchat message provider. She helped to build the internal web app by using the trendy tech stacks.",
        skillset: "AngularJs, CoffeeScript, NodeJs, Express, Mocha, Chai, Less",
        commands: { More: "all" }
    },
    "wifarer": {
        description: "Echo worked as a IOS Developer Internal at Wifarer, a Victoria, BC based indoor positioning company. She involved in the IOS development of the Wifarer app, performed the QA testing role and wrote automated tests.",
        skillset: "Objective-C, Xcode, Cucumber",
        commands: { More: "all" }
    },
    "blackberry": {
        description: "Echo worked as a Java Developer Intern at Blackberry, performed hands testing and automated testings.",
        skillset: "Java, JUnit",
        commands: { More: "all" }
    }
}

bot.dialog('/experience', [
    function(session, args) {
        var experience = experiences[args.experience];
        session.dialogData.commands = experience.commands;
        session.send(experience.description);
        if (experience.skillset != null)
            session.send('Skills: ' + experience.skillset);
        builder.Prompts.choice(session, "Back to experience list", experience.commands);
    },
    function(session, results) {
        var destination = session.dialogData.commands[results.response.entity];
        session.replaceDialog("/experience", { experience: destination });
    }
]);

bot.dialog('/schedule',
    function(session) {
        session.send('[Schdeule a real talk with Echo](https://calendly.com/chatwithecho)');
    }
);