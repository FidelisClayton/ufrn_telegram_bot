(() => {
    "use strict";

    const emoji = require('node-emoji').emoji;
    const TelegramBot = require('node-telegram-bot-api');
    const UFRNController = require('./../controllers/UFRNController.js')();

    module.exports = () => {
        const token = 'YOUR_TELEGRAM_TOKEN';
        const ruBot = new TelegramBot(token, {polling: true});

        ruBot.onText(/(almoço|almoco)/, (msg) => {
            UFRNController.viewAlmoco(ruBot, msg);
        });

        ruBot.onText(/(jantar|janta)/, (msg) => {
            UFRNController.viewJantar(ruBot, msg);
        });

        ruBot.onText(/circular/, (msg) => {
            console.log(msg);
            UFRNController.viewBus(ruBot, msg);
        });

        ruBot.onText(/(\/start|oi|Oi|olá|Olá|ola|olá|Iae|iae)/, (msg) => {
            console.log(msg);
            const options = {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: 'Cardápio R.U', callback_data: 'view_ru'},{ text: 'Circular', callback_data: 'view_bus'}]
                    ]
                }),
                parse_mode: 'Markdown'
            };

            ruBot.sendMessage(msg.from.id, 'Olá *' + msg.from.first_name + '*, o que deseja consultar?', options);
        });

        ruBot.on('callback_query', (msg) => {
            switch(msg.data) {
                case 'view_almoco':
                    UFRNController.viewAlmoco(ruBot, msg);

                    break;

                case 'view_jantar':
                    UFRNController.viewJantar(ruBot, msg);

                    break;

                case 'view_bus':
                    UFRNController.viewBus(ruBot, msg);

                    break;

                case 'view_ru':
                    const options = {
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{ text: 'Almoço',  callback_data: 'view_almoco' }, { text: 'Jantar', callback_data: 'view_jantar' }]
                            ]
                        }),
                        parse_mode: 'Markdown'
                    };

                    ruBot.sendMessage(msg.from.id, "Almoço ou jantar?", options);

                    break;
                default:
                    const action = msg.data.split(' ')[0];
                    const payload = msg.data.split(' ')[1];

                    switch(action) {
                        case 'view_stop':
                            UFRNController.viewStop(ruBot, msg, payload);
                            break;
                    }

                    break;
            }
        });
    };


})();
