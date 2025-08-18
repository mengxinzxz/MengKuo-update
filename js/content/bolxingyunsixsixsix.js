import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '幸运666',
    mode: 'identity',
    intro: [
        '五人军争模式',
        '游戏中，每当有一名角色使用或打出一张点数为6的牌时，可从幸运牌堆中抽取一张卡牌，然后立即执行其效果。',
        '幸运牌结算完成后移出幸运牌堆，直到幸运牌堆最后一张牌被抽取后，将6张幸运牌重新洗混形成新的幸运牌堆。',
        '幸运牌堆：<br>' +
        '&nbsp&nbsp<img width="65" src="' + lib.assetURL + 'extension/活动萌扩/image/bolxingyun_tao.png">' +
        ' <img width="65" src="' + lib.assetURL + 'extension/活动萌扩/image/bolxingyun_tao.png">' +
        ' <img width="65" src="' + lib.assetURL + 'extension/活动萌扩/image/bolxingyun_wuzhong.png">' +
        ' <img width="65" src="' + lib.assetURL + 'extension/活动萌扩/image/bolxingyun_wuzhong.png">' +
        ' <img width="65" src="' + lib.assetURL + 'extension/活动萌扩/image/bolxingyun_zhuanyun.png">' +
        ' <img width="65" src="' + lib.assetURL + 'extension/活动萌扩/image/bolxingyun_tianqian.png">'
    ],
    showcase(init) {
        var xysix = ui.create.div();
        xysix.style.height = '336px';
        xysix.style.width = '628px';
        xysix.style.left = 'calc(50% - 314px)';
        xysix.style.top = '-70px';
        xysix.setBackgroundImage('extension/活动萌扩/image/bolxingyunsixsixsix.png');
        this.appendChild(xysix);
    },
    init() {
        lib.configOL.number = 5;
        lib.translate.bolxingyun_tao = '幸运桃';
        lib.translate.bolxingyun_tao_info = '回复1点体力';
        lib.translate.bolxingyun_wuzhong = '幸运生财';
        lib.translate.bolxingyun_wuzhong_info = '摸两张牌';
        lib.translate.bolxingyun_zhuanyun = '转运卡';
        lib.translate.bolxingyun_zhuanyun_info = '弃置任意张牌并摸等量的牌';
        lib.translate.bolxingyun_tianqian = '天谴';
        lib.translate.bolxingyun_tianqian_info = '将其武将牌翻转至背面朝上';
        lib.skill._bolxingyunsixsixsix = {
            charlotte: true,
            trigger: { player: ['useCard', 'respond'] },
            filter(event, player) {
                return event.card && get.number(event.card) == 6;
            },
            direct: true,
            priority: Infinity,
            content() {
                'step 0'
                var name = _status.xingyunCard.randomRemove();
                var cardname = name;
                event.name = name;
                lib.card[cardname] = {
                    fullimage: true,
                    image: 'ext:活动萌扩/image/' + name + '.png',
                };
                lib.translate[cardname] = ' ';
                event.videoId = lib.status.videoId++;
                game.broadcastAll(function (player, id, card) {
                    ui.create.dialog(get.translation(player) + '抽取的幸运卡', [[card], 'card']).videoId = id;
                }, player, event.videoId, game.createCard(cardname, ' ', ' '));
                game.delay(3);
                'step 1'
                game.broadcastAll('closeDialog', event.videoId);
                switch (event.name) {
                    case 'bolxingyun_tao':
                        player.recover();
                        event.goto(3);
                        break;
                    case 'bolxingyun_wuzhong':
                        player.draw(2);
                        event.goto(3);
                        break;
                    case 'bolxingyun_zhuanyun':
                        if (player.countCards('he')) player.chooseToDiscard('he', '弃置任意张牌并摸等量的牌', [1, player.countCards('h')], true).set('ai', lib.skill.zhiheng.check).set('complexCard', true);
                        else event.goto(3);
                        break;
                    case 'bolxingyun_tianqian':
                        if (!player.isTurnedOver()) player.turnOver();
                        event.goto(3);
                        break;
                }
                'step 2'
                if (result.bool) player.draw(result.cards.length);
                'step 3'
                if (!_status.xingyunCard.length) _status.xingyunCard = ['bolxingyun_tao', 'bolxingyun_tao', 'bolxingyun_wuzhong', 'bolxingyun_wuzhong', 'bolxingyun_zhuanyun', 'bolxingyun_tianqian'];
            },
        };
    },
    content: {
        gameStart() {
            _status.xingyunCard = ['bolxingyun_tao', 'bolxingyun_tao', 'bolxingyun_wuzhong', 'bolxingyun_wuzhong', 'bolxingyun_zhuanyun', 'bolxingyun_tianqian'];
        },
    },
};

export default brawl;