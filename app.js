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
    var card = new builder.HeroCard(session)
      .title("Echo's Resume Bot")
      .text("Everything you need to know about Echo!")
      .images([
        builder.CardImage.create(session, "http://docs.botframework.com/images/demo_bot_image.png")
      ])
      .buttons([
        builder.CardAction.dialogAction(session, "experience", "all", "Experience"),
        builder.CardAction.dialogAction(session, "schedule", "/schedule", "Schedule A Meeting")
      ]);
    var msg = new builder.Message(session).attachments([card]);
    session.send(msg);
    session.send("Hi! I am Echo's personal resume bot, I can show you more about Echo, and help you to schedule a meeting with the real Echo!");
  }
]);

var experiences = {
  "all": {
    duty: "Tell me more about Echo's working experience!",
    commands: { architech: "Architech", xe: "Xe", catchChat: "Catchchat", wifarer: "Wifarer", blackberry: "Blackberry" }
  },
  "architech": {
    duty: "Echo worked at Architech, a custom software engineering and design company as a Web Developer. She helped in several projects with different clients by providing her web development expertise. She and her algie buddies made a distribution portal for Boar's Head, and the service ss available for thousands users across America. She and her scrum buddys improved the PointClickCare’s health care cloud platform, which is used by the stuffs in several senior facilities across North America.",
    skillset: "JavaScript, Gulp, Vagrant, Sass, UIkit, Elasticsearch, dotCMS, Java, JUnit, SQL, Visualforce",
    position: "Web Developer",
    url: "http://www.architech.ca",
    logoUrl: "http://www.architech.ca/images/4712cf6e.architech_logo.png",
  },
  "xe": {
    duty: "Echo worked at XE.com, the online foreign exchange provider, as a UX Developer. She invloved in the UX design and web development of the xe.com website, and many other marketing pages. She also helped to build the currency plugin using XE.com API for DuckDuckGo. She optimized and improved the accessibility for xe.com, which viewed by thousands of users per day, ranked by Alexa as the top 600 of all sites worldwide by traffic.",
    skillset: "PHP, JavaScript, HTML, Sass, AngularJs, NodeJs, Perl, Photoshop, Balsamiq mockup",
    position: "Web Developer",
    url: "http://www.architech.ca",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/55/XE_Corporation_logo.png",
  },
  "catchchat": {
    duty: "Echo worked as a web developer remotely for CatchChat, a Chinese version of snapchat message provider. She helped to build the internal web app by using the trendy tech stacks.",
    skillset: "AngularJs, CoffeeScript, NodeJs, Express, Moqcha, Chai, Less",
    position: "Front End Developer",
    url: "http://catchchat.me",
    logoUrl: "https://dn-catchinc.qbox.me/catchchat/appicon.png",
  },
  "wifarer": {
    duty: "Echo worked as a IOS Developer Internal at Wifarer, a Victoria, BC based indoor positioning company. She involved in the IOS development of the Wifarer app, performed the QA testing role and wrote automated tests.",
    skillset: "Objective-C, Xcode, Cucumber",
    position: "IOS Developer Intern",
    url: "http://www.wifarer.com",
    logoUrl: "http://www.wifarer.com/files/large/wifarer-logo.png",
  },
  "blackberry": {
    duty: "Echo worked as a Java Developer Intern at Blackberry, performed hands testing and automated testings.",
    skillset: "Java, JUnit",
    position: "Software Developer Intern",
    url: "http://ca.blackberry.com/home.html",
    logoUrl: "http://tech4world.net/wp-content/uploads/2011/08/blackberry_logo__black.jpg",
  }
}

bot.dialog('/experience', [
  function(session, args) {
    var card = new builder.HeroCard(session)
      .title("Experience")
      .text("Everything you need to know about Echo!")
      .images([
        builder.CardImage.create(session, "http://docs.botframework.com/images/demo_bot_image.png")
      ])
      .buttons([
        builder.CardAction.dialogAction(session, "architech", "architech", "Architech"),
        builder.CardAction.dialogAction(session, "xe", "xe", "Xe"),
        builder.CardAction.dialogAction(session, "catchchat", "catchchat", "CatchChat"),
        builder.CardAction.dialogAction(session, "wifarer", "wifarer", "Wifarer"),
        builder.CardAction.dialogAction(session, "blackberry", "blackberry", "Blackberry")
      ]);
    var msg = new builder.Message(session).attachments([card]);
    session.send(msg);
  }
]);

bot.dialog('/architech',
  function(session) {
    var company = experiences.architech;
    var card = new builder.ThumbnailCard(session)
      .title("Architech")
      .subtitle(company.position)
      .text(company.duty)
      .images([
        builder.CardImage.create(session, company.logoUrl)
      ])
      .tap(builder.CardAction.openUrl(session, company.url));
    var msg = new builder.Message(session).attachments([card]);
    session.send(msg);
  }
);

bot.dialog('/xe',
  function(session) {
    var company = experiences.xe;
    var card = new builder.ThumbnailCard(session)
      .title("Xe.com")
      .subtitle(company.position)
      .text(company.duty)
      .images([
        builder.CardImage.create(session, company.logoUrl)
      ])
      .tap(builder.CardAction.openUrl(session, company.url));
    var msg = new builder.Message(session).attachments([card]);
    session.send(msg);
  }
);

bot.dialog('/catchchat',
  function(session) {
    var company = experiences.catchchat;
    var card = new builder.ThumbnailCard(session)
      .title("CatchChat")
      .subtitle(company.position)
      .text(company.duty)
      .images([
        builder.CardImage.create(session, company.logoUrl)
      ])
      .tap(builder.CardAction.openUrl(session, company.url));
    var msg = new builder.Message(session).attachments([card]);
    session.send(msg);
  }
);

bot.dialog('/wifarer',
  function(session) {
    var company = experiences.wifarer;
    var card = new builder.ThumbnailCard(session)
      .title("Wifarer")
      .subtitle(company.position)
      .text(company.duty)
      .images([
        builder.CardImage.create(session, company.logoUrl)
      ])
      .tap(builder.CardAction.openUrl(session, company.url));
    var msg = new builder.Message(session).attachments([card]);
    session.send(msg);
  }
);

bot.dialog('/blackberry',
  function(session) {
    var company = experiences.blackberry;
    var card = new builder.ThumbnailCard(session)
      .title("Blackberry")
      .subtitle(company.position)
      .text(company.duty)
      .images([
        builder.CardImage.create(session, company.logoUrl)
      ])
      .tap(builder.CardAction.openUrl(session, company.url));
    var msg = new builder.Message(session).attachments([card]);
    session.send(msg);
  }
);

bot.dialog('/schedule',
  function(session) {
    session.send('[Schdeule a talk with real Echo](https://calendly.com/chatwithecho)');
  }
);

bot.beginDialogAction('experience', '/experience');
bot.beginDialogAction('schedule', '/schedule');
bot.beginDialogAction('architech', '/architech');
bot.beginDialogAction('xe', '/xe');
bot.beginDialogAction('catchchat', '/catchchat');
bot.beginDialogAction('wifarer', '/wifarer');
bot.beginDialogAction('blackberry', '/blackberry');