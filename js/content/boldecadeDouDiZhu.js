import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
//点击显示
get.mx_skillTips = function (tipname, id) {
    var dibeijing = ui.create.div('.bol-dibeijing', document.body);
    dibeijing.style.zIndex = 16;
    var skilltip = ui.create.div('.bol-skilltip', dibeijing);
    skilltip.innerHTML = tipname;
    var herf = document.getElementById(id);
    if (herf) {
        var left = herf.getBoundingClientRect().left;
        if (game.getBolPhone()) left += herf.offsetParent.offsetLeft;
        left += document.body.offsetWidth * 0.15;
        skilltip.style.left = left + 'px';
        skilltip.style.top = (herf.getBoundingClientRect().top + 30) + 'px';
    }
    dibeijing.listen(function (e) {
        e.stopPropagation();
        this.remove();
    })
};
get.mx_inform = function (str1, str2) {
    const id = Math.random().toString(36).slice(-8);
    return "<a id='" + id + "' style='color:unset' href=\"javascript:get.mx_skillTips('" + str2 + "','" + id + "');\">" + str1 + "※</a>";
};
const brawl = {
    name: '新斗地主',
    mode: 'identity',
    intro: [
        '游戏规则：<br>' +
        '游戏开始时，牌局将为玩家分发五张初始武将牌，玩家可以根据武将信息决定是否叫分抢地主。<br>' +
        '从随机一名玩家开始依次开始叫分抢地主，玩家选择叫分倍数，叫分最多的玩家成为地主，最多为3倍，也可放弃叫分。<br>' +
        '每位玩家仅有一次叫分机会，且叫分必须大于上家的叫分，否则放弃叫分。<br>' +
        '叫分过程中，若有玩家叫分3倍则该玩家直接成为地主。<br>' +
        '若三名玩家都放弃叫分，第一个叫分的玩家以最低倍数成为地主。<br>' +
        '确认地主后，地主玩家默认成为一号位。其余两位玩家自动成为农民玩家，两位农民玩家的选将框互相知悉。<br>' +
        '地主玩家的选将框在原有武将上额外增加两个随机武将。<br>' +
        '发放初始手牌后，三位玩家同时可以选择是否明牌：若地主选择明牌，本局倍数翻1倍；若农民选择明牌，本局倍数翻0.5倍。',
        '地主额外技能：<br>' +
        '【飞扬】：锁定技，你的摸牌阶段的摸牌数+1，出牌阶段使用【杀】的额定次数+1。<br>' +
        '【跋扈】：判定阶段开始时，你可以弃置两张手牌并弃置判定区所有牌。',
    ],
    init: function () {
        lib.configOL.number = 3;
        lib.config.mode_config.identity.double_character = false;
        lib.skill.decade_feiyang = {
            charlotte: true,
            trigger: { player: 'phaseJudgeBegin' },
            filter: function (event, player) {
                return player.countCards('j') && player.countCards('h') >= 2;
            },
            direct: true,
            content: function () {
                'step 0'
                player.chooseToDiscard(get.prompt2('decade_bahu'), 2).set('ai', function (card) {
                    return 6 - get.value(card);
                }).set('logSkill', 'decade_feiyang');
                'step 1'
                if (result.bool) player.discard(player.getCards('j'));
            },
        };
        lib.skill.decade_bahu = {
            charlotte: true,
            mod: {
                cardUsable: function (card, player, num) {
                    if (card.name == 'sha') return num + 1;
                },
            },
            trigger: { player: 'phaseDrawBegin2' },
            filter: function (event, player) {
                return !event.numFixed;
            },
            forced: true,
            content: function () {
                trigger.num++;
            },
        };
        lib.skill._decade_dizhu = {
            charlotte: true,
            ruleSkill: true,
            trigger: { global: 'gameDrawEnd' },
            direct: true,
            priority: 1 + 1 + 1,
            firstDo: true,
            content: function () {
                'step 0'
                player.chooseBool('是否明牌？', '令本局游戏的倍数翻' + (game.zhu == player ? '1' : '0.5') + '倍').set('choice', Math.random() < 0.4);
                'step 1'
                player.chooseED = true;
                if (result.bool) {
                    player.chat('明牌');
                    game.log(player, '选择', '#g明牌');
                    player.addSkill('decade_dizhu_mingpai');
                    game.decade_doudizhu += (game.zhu == player ? 1 : 0.5);
                }
                else {
                    player.chat('不明牌');
                    game.log(player, '选择', '#y不明牌');
                }
                'step 2'
                game.delay(1.5);
                if (!game.hasPlayer(function (current) {
                    return !current.chooseED;
                })) {
                    for (var i of game.players) delete i.chooseED;
                    if (game.decade_doudizhu == 1) game.log('本局没有额外加倍');
                    else {
                        game.log('本局斗地主倍数翻' + game.decade_doudizhu + '倍');
                        game.max_beishu = game.max_beishu * game.decade_doudizhu;
                        game.broadcastAll(function () {
                            if (ui.decade_ddzInfo) ui.decade_ddzInfo.innerHTML = '本局倍数：' + game.max_beishu * 100;
                        });
                    }
                }
            },
        };
        lib.skill.decade_dizhu_mingpai = {
            charlotte: true,
            global: 'decade_dizhu_mingpai_mingpai',
            mark: true,
            marktext: '牌',
            intro: {
                mark: function (dialog, content, player) {
                    var hs = player.getCards('h');
                    if (hs.length) {
                        dialog.addText('明牌勇气可嘉，胜负代价更高！本局游戏倍数翻倍！');
                        dialog.addSmall(hs);
                    }
                    else dialog.addText('无手牌');
                },
                content: function (content, player) {
                    var hs = player.getCards('h');
                    if (hs.length) return get.translation(hs);
                    else return '无手牌';
                },
            },
            subSkill: {
                mingpai: {
                    ai: {
                        viewHandcard: true,
                        skillTagFilter: function (player, arg, target) {
                            return target != player && target.hasSkill('decade_dizhu_mingpai');
                        },
                    },
                },
            },
        };
        lib.skill._decade_doudizhu_view = {
            ai: {
                viewHandcard: true,
                skillTagFilter: function (player, arg, target) {
                    return target != player && target.identity == player.identity;
                },
            },
        };
        lib.translate.decade_feiyang = '飞扬';
        lib.translate.decade_feiyang_info = '锁定技，你的摸牌阶段的摸牌数+1，出牌阶段使用【杀】的额定次数+1。';
        lib.translate.decade_bahu = '跋扈';
        lib.translate.decade_bahu_info = '判定阶段开始时，你可以弃置两张手牌并弃置判定区所有牌。';
        lib.translate.decade_dizhu_mingpai = '明牌';
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore: function () {
            //开启闪连
            if (lib.config.extension_活动萌扩_decade_shanlian) {
                lib.skill.decade_shanlian = {
                    charlotte: true,
                    trigger: { player: 'gainAfter', global: 'loseAsyncAfter' },
                    filter: function (event, player) {
                        return event.getg(player).some(card => card.name == 'shan');
                    },
                    forced: true,
                    content: function () {
                        player.draw();
                    },
                };
                lib.translate.decade_shanlian = '闪连';
                game.addGlobalSkill('decade_shanlian');
                const showShanLianEvent = function () {
                    if (ui.ShanLianEvent) return;
                    ui.ShanLianEvent = ui.create.system('闪连', null, true);
                    lib.setPopped(ui.ShanLianEvent, function () {
                        var uiintro = ui.create.dialog('hidden');
                        uiintro.add('全局技能【闪连】已生效');
                        const info = '锁定技，当你获得【闪】后，你摸一张牌。';
                        uiintro.add('<div class="text center">' + info + '</div>');
                        var ul = uiintro.querySelector('ul');
                        if (ul) ul.style.width = '180px';
                        uiintro.add(ui.create.div('.placeholder'));
                        return uiintro;
                    }, 250);
                };
                showShanLianEvent();
            }
            //选将加载
            if (!_status.characterlist) lib.skill.pingjian.initList();
            _status.HDcharacterlist = _status.characterlist.slice();
            if (lib.config.extension_活动萌扩_use_DDZname) {
                var map = lib.config.extension_活动萌扩_DDZname || [
                    'shen_zhaoyun', 'shen_ganning', 'liuyan', 'xizhicai', 're_wuyi', 'xin_lingtong', 'zhoushan', 'chengui',
                    'dc_liuye', 'dc_tengfanglan', 'shen_machao', 'shen_zhangfei', 'shen_zhangjiao', 'shen_dengai', 're_liuzan', 'caojinyu',
                    're_sunyi', 'caomao', 'xushao', 'zhujianping', 'tenggongzhu', 'zhangxuan', 'dc_zhouxuān', 'zerong',
                    'dc_luotong', 'ruanji', 'dc_xujing', 'xuelingyun', 'yue_caiwenji', 'star_caoren'
                ];
                _status.HDcharacterlist = _status.HDcharacterlist.filter(name => map.includes(name));
            }
            if (!game.decade_doudizhu) game.decade_doudizhu = 1;
            game.decadeDouDiZhu = {
                hasZhuSkill: () => false,
                $dieAfter: function () {
                    if (_status.video) return;
                    if (!this.node.dieidentity) {
                        var str = { zhu: '地主', fan: '农民' }[this.identity];
                        var node = ui.create.div('.damage.dieidentity', str, this);
                        ui.refresh(node);
                        node.style.opacity = 1;
                        this.node.dieidentity = node;
                    }
                    var trans = this.style.transform;
                    if (trans) {
                        if (trans.indexOf('rotateY') != -1) {
                            this.node.dieidentity.style.transform = 'rotateY(180deg)';
                        }
                        else if (trans.indexOf('rotateX') != -1) {
                            this.node.dieidentity.style.transform = 'rotateX(180deg)';
                        }
                        else {
                            this.node.dieidentity.style.transform = '';
                        }
                    }
                    else {
                        this.node.dieidentity.style.transform = '';
                    }
                },
                dieAfter: function () {
                    game.checkResult();
                },
                dieAfter2: function () {
                    if (this.identity != 'fan') return;
                    var player = this, target = game.findPlayer(function (current) {
                        return current != player && current.identity == 'fan';
                    });
                    if (target && target == game.me) {
                        ui.create.system('投降', function () {
                            game.log(game.me, '投降');
                            game.over(false);
                        }, true);
                    }
                },
            };
            for (var i in game.decadeDouDiZhu) lib.element.player[i] = game.decadeDouDiZhu[i];
            for (var i of game.players) {
                for (var j in game.decadeDouDiZhu) i[j] = game.decadeDouDiZhu[j];
                i.identity = 'cai';
                i.setIdentity();
                i.identityShown = true;
            }
            //设置态度值
            get.rawAttitude = function (from, to) {
                if (!from || !to) return 0;
                if (from.identity == to.identity) return 10;
                return -10;
            };
            game.showIdentity(true);
            game.checkResult = function () {
                if (!game.zhu.isAlive() || !game.players.some(function (current) {
                    return current.identity == 'fan';
                })) game.over((!game.zhu.isAlive() && game.me.identity == 'fan') || !game.players.some(function (current) {
                    return current.identity == 'fan';
                }) && game.me.identity == 'zhu');
            };
            game.broadcastAll(function () {
                if (get.is.phoneLayout()) ui.decade_ddzInfo = ui.create.div('.touchinfo.left', ui.window);
                else ui.decade_ddzInfo = ui.create.div(ui.gameinfo);
                ui.decade_ddzInfo.innerHTML = '抢地主阶段';
            });
            lib.onover.push(function (bool) {
                var num = game.max_beishu * 100 * (game.zhu == game.me ? 2 : 1);
                var numx = game.max_beishu * 100;
                if (bool == undefined) {
                    for (var i of game.filterPlayer2()) i.chat('+0');
                }
                else {
                    if (game.zhu.isAlive()) {
                        for (var i of game.filterPlayer2()) {
                            if (i == game.zhu) i.chat('+' + numx * 2);
                            else i.chat('-' + numx);
                        }
                    }
                    if (!game.zhu.isAlive()) {
                        for (var i of game.filterPlayer2()) {
                            if (i == game.zhu) i.chat('-' + numx * 2);
                            else i.chat('+' + numx);
                        }
                    }
                }
            });
            game.chooseCharacter = function () {
                var next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.setContent(function () {
                    "step 0"
                    game.saveConfig('extension_活动萌扩_decade_Coin_Gaming', 100);
                    ui.arena.classList.add('choose-character');
                    for (var i of game.players) {
                        i.characterlist = _status.HDcharacterlist.randomRemove(5);
                        var content = ['你的初始武将', [i.characterlist, 'character']];
                        i.chooseControl('ok').set('dialog', content);
                    }
                    var target = game.players.randomGet();
                    event.control = ['一倍', '两倍', '三倍', '不叫'];
                    event.target = target;
                    event.beginner = target;
                    "step 1"
                    var control = event.control;
                    target.chooseControl(control).set('ai', function () {
                        return control.randomGet();
                    }).set('prompt', '是否' + (control.length == 4 ? '叫' : '抢') + '地主？');
                    "step 2"
                    var getBeiShu = function (control) {
                        switch (control) {
                            case '一倍': return 1; break;
                            case '两倍': return 2; break;
                            case '三倍': return 3; break;
                            case '不叫': return 0; break;
                        }
                    };
                    target.chat(result.control);
                    var num = event.control.indexOf(result.control);
                    target.max_beishu = getBeiShu(result.control);
                    game.saveConfig('extension_活动萌扩_decade_Coin_Gaming', target.max_beishu * 100);
                    if (result.control == '三倍') {
                        game.winner = target;
                        game.max_beishu = 3;
                    }
                    else {
                        if (target.next != event.beginner) game.delay(1.5);
                        if (result.control != '不叫') {
                            var temp = [];
                            for (var i = 0; i < event.control.length; i++) {
                                if (i > num) temp.push(event.control[i]);
                            }
                            event.control = temp;
                        }
                        if (target.next == event.beginner) {
                            if (event.control.length == 4) {
                                game.winner = event.beginner;
                                game.max_beishu = 1;
                            }
                            else {
                                var winner = game.findPlayer(function (current) {
                                    return !game.hasPlayer(function (currentx) {
                                        return current.max_beishu < currentx.max_beishu;
                                    });
                                });
                                game.winner = winner;
                                game.max_beishu = winner.max_beishu;
                            }
                        }
                        else {
                            event.target = target.next;
                            event.goto(1);
                        }
                    }
                    'step 3'
                    game.broadcastAll(function () {
                        if (ui.decade_ddzInfo) ui.decade_ddzInfo.innerHTML = '本局倍数：' + game.max_beishu * 100;
                    });
                    game.winner.characterlist.addArray(_status.HDcharacterlist.randomRemove(2));
                    for (var i of game.players) {
                        i.identity = (game.winner == i ? 'zhu' : 'fan');
                        i.setIdentity();
                        i.identityShown = true;
                        if (i.identity == 'zhu') game.zhu = i;
                    }
                    'step 4'
                    var getNum = function (name) {
                        var num;
                        switch (game.getRarity(name)) {
                            case 'junk': num = 1; break;
                            case 'rare': num = 3; break;
                            case 'epic': num = 4; break;
                            case 'legend': num = 5; break;
                            default: num = 2; break;
                        }
                        return num;
                    };
                    var getCharacter = function (list) {
                        var listx = [], num = 0;
                        for (var name of list) {
                            var numx = getNum(name);
                            if (numx > num) {
                                num = numx;
                                listx = [name];
                            }
                            else if (numx == num) listx.push(name);
                        }
                        return listx;
                    };
                    var createDialog = ['请选择你的武将'];
                    if (game.me.identity == 'fan') {
                        var fellow = game.findPlayer(function (current) {
                            return current != game.me && current.identity == game.me.identity;
                        });
                        createDialog.push('<div class="text center">玩家武将</div>');
                        createDialog.push([game.me.characterlist, 'characterx']);
                        createDialog.push('<div class="text center">队友武将</div>');
                        createDialog.push([fellow.characterlist, 'character']);
                    }
                    else createDialog.push([game.me.characterlist, 'characterx']);
                    game.me.chooseButton(createDialog, true).set('onfree', true).set('filterButton', function (button) {
                        return !_status.event.list.includes(button.link);
                    }).set('ai', function (button) {
                        return getCharacter(_status.event.listx).randomGet();
                    }).set('list', fellow ? fellow.characterlist : []).set('listx', game.me.characterlist);
                    'step 5'
                    var getNum = function (name) {
                        var num;
                        switch (game.getRarity(name)) {
                            case 'junk': num = 1; break;
                            case 'rare': num = 3; break;
                            case 'epic': num = 4; break;
                            case 'legend': num = 5; break;
                            default: num = 2; break;
                        }
                        return num;
                    };
                    var getCharacter = function (list) {
                        var listx = [], num = 0;
                        for (var name of list) {
                            var numx = getNum(name);
                            if (numx > num) {
                                num = numx;
                                listx = [name];
                            }
                            else if (numx == num) listx.push(name);
                        }
                        return listx;
                    };
                    game.me.init(result.links[0]);
                    for (var i of game.players) {
                        if (i != game.me) i.init(getCharacter(i.characterlist).randomGet());
                    }
                    if (game.me.identity == 'zhu') {
                        ui.create.system('投降', function () {
                            game.log(game.me, '投降');
                            game.over(false);
                        }, true);
                    }
                    'step 6'
                    for (var i of game.players) {
                        delete i.characterlist;
                        delete i.max_beishu;
                        _status.characterlist.remove(i.name);
                        _status.characterlist.remove(i.name1);
                        _status.characterlist.remove(i.name2);
                    }
                    game.zhu.maxHp = game.zhu.maxHp + 1;
                    game.zhu.hp = game.zhu.hp + 1;
                    game.zhu.update();
                    game.zhu.addSkill('decade_feiyang');
                    game.zhu.addSkill('decade_bahu');
                    'step 7'
                    delete _status.HDcharacterlist;
                    setTimeout(function () {
                        ui.arena.classList.remove('choose-character');
                    }, 500);
                });
            };
        },
    },
};

export default brawl;