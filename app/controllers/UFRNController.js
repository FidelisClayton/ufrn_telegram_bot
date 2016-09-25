(() => {
    "use strict";

    const emoji = require('node-emoji');
    const http = require('http');

    module.exports = () => {
        const controller = {};

        const defaultOptions = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Almoço' , callback_data: 'view_almoco' }],
                    [{ text: 'Jantar', callback_data: 'view_jantar' }],
                ]
            })
        };

        let imageToEmoji = (image) => {
            let emoji = '';

            switch(image) {
                case 'principal2':
                    emoji = 'poultry_leg';
                    break;

                case 'principal4':
                    emoji = 'fish';
                    break;

                case 'salada19':
                    emoji = 'bento';
                    break;

                case 'preparacao2':
                    emoji = 'stew';
                    break;

                case 'preparacao6':
                    emoji = 'stew';
                    break;

                case 'arroz1':
                    emoji = 'rice';
                    break;

                case 'arroz2':
                    emoji = 'rice';
                    break;

                case 'suco3':
                    emoji = 'tropical_drink';
                    break;

                case 'fruta3':
                    emoji = 'apple';
                    break;

                case 'vegetariano22':
                    emoji = 'bread';
                    break;

                default:
                    emoji = 'small_blue_diamond';
                    break;
            }

            return emoji;
        };


        let formatData = (data) => {
            const formatedData = {};
            //Gambiarra
            const lineBreak = `\n`;

            let acompanhamentoItems = "";
            let principalItems = "";
            let vegetarianoItems = "";

            if(!!data.vegetariano)
                data.vegetariano.map((prato) => {
                    vegetarianoItems += emoji.get(imageToEmoji(prato.icon.split('.')[0])) + ' - ' + prato.nome + lineBreak; 
                });

            data.acompanhamentos.map((acompanhamento) => {
                acompanhamentoItems += emoji.get(imageToEmoji(acompanhamento.icon.split('.')[0])) + ' - ' + acompanhamento.nome + lineBreak; 
            });

            data.proteinas.map((principal) => {
                principalItems += emoji.get(imageToEmoji(principal.icon.split('.')[0])) + ' - ' + principal.nome + lineBreak; 
            });

            formatedData.acompanhamentos =  lineBreak + '*Acompanhamentos:*' + lineBreak + acompanhamentoItems;
            formatedData.principal = lineBreak + '*Prato principal:*' + lineBreak + principalItems;
            if(!!data.vegetariano)
                formatedData.vegetariano = lineBreak + '*Vegetariano:*' + lineBreak + vegetarianoItems;
            else
                formatedData.vegetariano = lineBreak + 'Cardápio vegetariano não disponível.'

            return formatedData;
        };

        let getDate = () => {
            const date = new Date();

            let data = "";

            let ano = String(date.getFullYear());
            let mes = date.getMonth() + 1;
            let dia = date.getDate();

            if(dia < 10) {
                dia = '0' + dia;
            }

            if(mes < 10) {
                mes = '0' + mes;
            }

            return ano + mes + dia;
        };


        controller.viewJantar = (bot, msg) => {
            http.get(`http://www.ru.ufrn.br/cardapio/jantar${getDate()}.json`, (res) => {
                let body = '';
                let data = {};

                res.on("data", (chunck) => {
                    body += chunck;
                });

                res.on("end", () => {
                    // Verifica se o corpo começa com a estrutura <!DOCTYPE html>
                    if(body.charAt(0) !== '<') {
                        data = JSON.parse(body);

                        const formatedData = formatData(data);

                        bot.sendMessage(msg.from.id, formatedData.principal + formatedData.acompanhamentos + formatedData.vegetariano, {parse_mode: 'Markdown'});
                    } else {
                        bot.sendMessage(msg.from.id, "*Cardápio indisponível.*", defaultOptions);
                    }
                });
            });
        };

        controller.viewAlmoco = (bot, msg) => {
            http.get(`http://www.ru.ufrn.br/cardapio/almoco${getDate()}.json`, (res) => {
                let body = '';
                let data = {};

                res.on("data", (chunck) => {
                    body += chunck;
                });

                res.on("end", () => {
                    if(body.charAt(0) !== '<') {
                        data = JSON.parse(body);

                        const formatedData = formatData(data);

                        bot.sendMessage(msg.from.id, formatedData.principal + formatedData.acompanhamentos + formatedData.vegetariano, {parse_mode: 'Markdown'});
                    } else {
                        bot.sendMessage(msg.from.id, "*Cardápio indisponível.*", defaultOptions);
                    }
                });
            });
        };

        controller.viewBus = (bot, msg) => {
            const options = {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: 'Via direta', callback_data: 'view_stop ' + 3854782}, { text: 'DEART', callback_data: 'view_stop ' + 3854783}],
                        [{ text: 'Escola de Música', callback_data: 'view_stop ' + 3854986}],
                        [{ text: 'Reitoria - Direto', callback_data: 'view_stop ' + 3855923}, { text: 'Reitoria - Inverso', callback_data: 'view_stop '+ 3854785}],
                        [{ text: 'Ed. Física - 2', callback_data: 'view_stop ' + 3855924}],
                        [{ text: 'RU', callback_data: 'view_stop ' + 3854781}],
                        [{ text: 'CCSA - Direto', callback_data: 'view_stop ' + 3853419 }, { text: 'CCSA - Inverso', callback_data: 'view_stop ' + 3854795}],
                        [{ text: 'Setor II - Direto', callback_data: 'view_stop ' + 3854166}, { text: 'Setor II - Inverso', callback_data: 'view_stop ' + 3854794}],
                        [{ text: 'Geologia - Direto', callback_data: 'view_stop ' + 3854167}, { text: 'Geologia - Inverso', callback_data: 'view_stop ' + 3854793}],
                        [{ text: 'ECT - Direto', callback_data: 'view_stop ' + 3853330}, {text: 'ECT - Inverso', callback_data: 'view_stop ' + 3854791}]
                    ]
                }),
                parse_mode: 'Markdown'
            };
            bot.sendMessage(msg.from.id, 'Selecione o ponto de ônibus:', options);
        };

        controller.viewStop = (bot, msg, stopId) => {
            http.get(`http://api.plataforma.cittati.com.br/m3p/js/prediction/stop/${stopId}`, (res) => {
                let body = '';
                let data = {};
                let vehicles = [];

                res.on("data", (chunck) => {
                    body += chunck;
                });

                res.on("end", () => {
                    const lineBreak = `\n`;
                    const arrivalVehicles = [];
                    const departureVehicles = [];

                    data = JSON.parse(body);

                    data.services.map((service) => {
                        if(service.predictionType === "ARRIVAL"){
                            service.vehicles.map((vehicle) => {
                                if(service.routeCode === "588") {
                                    vehicle.linha = service.routeCode;
                                    vehicle.sentido = service.serviceMnemonic;
                                    arrivalVehicles.push(vehicle);
                                }
                            });
                        }

                        if(service.predictionType === "DEPARTURE") {
                            service.vehicles.map((vehicle) => {
                                if(service.routeCode === "588") {
                                    vehicle.linha = service.routeCode;
                                    vehicle.sentido = service.serviceMnemonic;
                                    departureVehicles.push(vehicle);
                                }
                            });
                        }
                    });

                    // Ordena por ordem de saída / chegada do ônibus
                    vehicles = 
                        vehicles.sort(function(a, b) {
                            if(a.prediction > b.prediction)
                                return 1;
                            if(a.prediction < b.prediction)
                                return -1;
                            return 0;
                        });

                    let message = "*Próximos ônibus:*" + lineBreak;
                    let messageArrival = "*Chegada:*" + lineBreak;
                    let messageDeparture = "*Saída:*" + lineBreak;

                    arrivalVehicles.map((vehicle) => {
                        messageArrival += emoji.get("bus") + " *" + vehicle.linha + '* ' + vehicle.sentido +' - ' + (Math.floor(vehicle.prediction / 60)) + ' min' + lineBreak;
                    });

                    departureVehicles.map((vehicle) => {
                        messageDeparture += emoji.get("bus") + " *" + vehicle.linha + '* ' + vehicle.sentido +' - ' + (Math.floor(vehicle.prediction / 60)) + ' min' + lineBreak;
                    });

                    bot.sendMessage(msg.from.id, message + messageArrival + messageDeparture, {parse_mode: 'Markdown'});
                });
            });
        };


        return controller;
    };
})();
