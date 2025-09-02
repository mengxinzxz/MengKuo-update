import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '合纵抗秦',
    mode: 'identity',
    intro: ['本模式为复刻OL合纵抗秦模式，关卡可于进入游戏后自选，角色形象、势力和等阶均可于扩展页面进行设置'],
    init() {
        lib.configOL.number = 1;
        lib.config.mode_config.identity.change_card = 'disabled';
        lib.config.mode_config.identity.double_character = false;
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore() {
            //配置更改
            _status.mode = 'normal';
            //选将
            game.chooseCharacter = function () {
                const next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.player = game.me;
                next.setContent(async function (event, trigger, player) {
                    game.zhu = player;
                    if (!_status.characterlist) lib.skill.pingjian.initList();
                    //机制加载
                    const changeFunction = {
                        get: {
                            hzkq_config: {
                                characterLevel: lib.config.extension_活动萌扩_kangqin_level,
                                character: lib.config.extension_活动萌扩_kangqin_player,
                                group: lib.config.extension_活动萌扩_kangqin_group,
                                lineName: Boolean(lib.config.extension_活动萌扩_kangqin_lineName),
                                playername: [
                                    '月宫亚由',
                                    '神尾观铃',
                                    '古河渚',
                                    '坂上智代',
                                    '星野梦美',
                                    '枣铃',
                                    '库特莉亚芙卡',
                                    '神户小鸟',
                                    '立华奏',
                                    '友利奈绪',
                                    '汐奈',
                                    '鸣濑白羽',
                                    '仲村ゆり',
                                    '藤林杏',
                                    '烟雨墨染',
                                    '诗笺',
                                    '苏婆玛丽奥',
                                    'doremy',
                                    '楼小楼',
                                    '西沉',
                                    '叫我蠢直',
                                    '骑着二乔上貂蝉',
                                    '内奸不会错',
                                    '綦薵',
                                    '轮回中的消逝者',
                                    'Sukincen',
                                    '太上大牛',
                                    '镜中尘',
                                    '明了',
                                    '阿Q',
                                    '昨日影',
                                    '蒜头王八',
                                    '凉茶',
                                    '萌新瑟瑟发抖',
                                    '情何以堪',
                                    '元春二六',
                                    '炒饭123℃',
                                    '夜渐寒忆往昔',
                                    '【物质主义】',
                                    '一曲离歌高唱',
                                    '绵绵不绝于耳',
                                    'L',
                                    '逆曲惜寒',
                                    '杜元枫',
                                    '三生六十',
                                    'Itsuka士道君',
                                    '菁幽',
                                    '殇雪飘零',
                                    '瓦力',
                                    '别来无恙',
                                    '大叔viv',
                                    '深邃暖爱',
                                    '北瓜南瓜东',
                                    '染柒',
                                    '543(21)0',
                                    '萌新（转型中）',
                                    '随性似风',
                                    '牢戏',
                                    '生熏鱼',
                                    '宁静致远',
                                    '雷',
                                    'Fire win',
                                    'Empty city°',
                                    '?',
                                    'lonely patients',
                                    '狂神',
                                    '睡觉不玻璃',
                                    '佐巴杨',
                                    '静以修身',
                                    '沐如风晨',
                                    '白银山幽灵',
                                    '咪咪狗',
                                    '超困每一天',
                                    '阿巴阿巴',
                                    '冰可乐喵',
                                    '小小王同志',
                                    '铝宝',
                                    '诺离鸡',
                                    '牢狂1103',
                                    '汤',
                                    '九个芒果',
                                    '梦的原野',
                                    '婉儿',
                                    '鹤鸣太初',
                                    '鬼神易',
                                    '风流之姿刘玄德',
                                    '鹿都智川介',
                                    '九黎东玥',
                                    '云时亦雨',
                                    '龙九帧',
                                    '老东西',
                                    '塞尔卡利亚当',
                                    '志志志志志志志志',
                                    '芝士雪豹',
                                    '策谋',
                                    '寒影',
                                    '尼家老子―尼蝶',
                                    '炙热心光',
                                    '血羽风饕',
                                    '是只起名废的祈明',
                                    '永雏塔菲',
                                    '孙笑川',
                                    '柴油鹿鹿',
                                    '琉紫苑',
                                    '狗妈',
                                    '丁真',
                                    '157',
                                    '科比布莱恩特',
                                    '牢大',
                                    '暴暴虫',
                                    '一人一小建',
                                    '吃蛋挞的折棒',
                                    '张献忠',
                                    '宝',
                                ],
                            },
                        },
                        game: {
                            gameDraw(player) {
                                const next = game.createEvent("gameDraw");
                                next.player = player || game.me;
                                next.num = function (player) {
                                    return [4, 4, 5, 5, 6, 6][player._kangqinLevel || 1];
                                };
                                next.setContent("gameDraw");
                                return next;
                            },
                            checkResult() {
                                if (!game.players.some(i => i.identity == 'zhu')) game.over(true);
                                else if (!game.players.some(i => i.identity == 'fan')) game.over(false);
                            },
                            versusMap: [
                                ['qinchao', 'daqin_shangyang', 'qinchao', 'sanguo', 'sanguo'],
                                ['qinchao', 'daqin_zhangyi', 'qinchao', 'sanguo', 'sanguo'],
                                ['qinchao', 'daqin_miyue', 'qinchao', 'sanguo', 'sanguo'],
                                ['qinchao', 'daqin_baiqi', 'qinchao', 'sanguo', 'sanguo'],
                                ['qinchao', 'daqin_zhaoji', 'qinchao', 'sanguo', 'sanguo'],
                                ['qinchao', 'daqin_yingzheng', 'qinchao', 'sanguo', 'sanguo'],
                                ['qinchao', 'sanguo', 'qinchao', 'sanguo', 'daqin_lvbuwei'],
                                ['qinchao', 'daqin_zhaogao', 'qinchao', 'sanguo', 'sanguo'],
                            ],
                            eventInfo: {
                                变法图强: '牌堆中加入三张【商鞅变法】。若商鞅在场，商鞅使用【商鞅变法】时可以多指定一个目标。',
                                合纵连横: '每轮开始时，场上所有角色进入横置状态。若张仪在场，拥有“横”标记的角色无法对横置的角色使用牌。',
                                长平之战: '游戏进入【鏖战模式】，且所有角色响应【杀】时需额外使用一张【闪】。若白起在场，秦势力角色的回合开始时，其从牌堆中获得一张【桃】。',
                                横扫六合: '牌堆中加入传国玉玺和真龙长剑。若嬴政在场，则改为嬴政装备之。',
                                吕氏春秋: '本局游戏中，所有男性角色摸牌阶段的摸牌数+1。若吕不韦在场，则其于回合外获得牌时，其额外摸一张牌。',
                                沙丘之变: '本局游戏中，阵亡角色的手牌和装备牌改为随机分配给场上所有的男性角色。若赵高在场，则改为赵高获得之。',
                                赵姬之乱: '本局游戏中，男性角色每回合第一次造成伤害时，受伤害角色摸一张牌。若赵姬在场，此效果的适用范围改为所有非秦势力角色。',
                                始称太后: '本局游戏中，女性角色的体力值和体力上限+1。若芈月在场，男性角色的回合开始时需令芈月回复1点体力或摸一张牌。',
                            },
                            setEvent(name) {
                                _status.kangqinEvent = name;
                                ui.kangqinEvent = ui.create.div('.touchinfo.left', ui.window);
                                ui.kangqinEvent.innerHTML = name;
                                if (ui.time3) ui.time3.style.display = 'none';
                                ui.kangqinEventInfo = ui.create.system(name, null, true);
                                lib.setPopped(
                                    ui.kangqinEventInfo,
                                    function () {
                                        var uiintro = ui.create.dialog('hidden');
                                        uiintro.add(name);
                                        uiintro.add('<div class="text center">' + game.eventInfo[name] + '</div>');
                                        return uiintro;
                                    },
                                    250
                                );
                                switch (name) {
                                    case '变法图强':
                                        lib.inpile.push('shangyangbianfa');
                                        for (var i = 0; i < 3; i++) {
                                            ui.cardPile.insertBefore(game.createCard('shangyangbianfa'), ui.cardPile.childNodes[get.rand(ui.cardPile.childElementCount)]);
                                        }
                                        game.updateRoundNumber();
                                        break;
                                    case '合纵连横':
                                        game.me.addSkill('kangqin_hezonglianheng');
                                        break;
                                    case '长平之战':
                                        ui.kangqinEvent.innerHTML += '/鏖战模式';
                                        _status._aozhan = true;
                                        game.playBackgroundMusic();
                                        game.countPlayer(function (current) {
                                            current.addSkill('aozhan');
                                            current.addSkill('kangqin_changpingzhizhan');
                                        });
                                        break;
                                    case '横扫六合':
                                        var player = game.findPlayer(function (current) {
                                            return current.name == 'daqin_yingzheng';
                                        });
                                        if (player) {
                                            player.equip(game.createCard('chuanguoyuxi', 'diamond', 1));
                                            player.equip(game.createCard('zhenlongchangjian', 'diamond', 1));
                                        } else {
                                            lib.inpile.addArray(['zhenlongchangjian', 'chuanguoyuxi']);
                                            ui.cardPile.insertBefore(game.createCard('chuanguoyuxi', 'diamond', 1), ui.cardPile.childNodes[get.rand(ui.cardPile.childElementCount)]);
                                            ui.cardPile.insertBefore(game.createCard('zhenlongchangjian', 'diamond', 1), ui.cardPile.childNodes[get.rand(ui.cardPile.childElementCount)]);
                                        }
                                        break;
                                    case '吕氏春秋':
                                        game.countPlayer(function (current) {
                                            current.addSkill('kangqin_lvshichunqiu');
                                        });
                                        break;
                                    case '沙丘之变':
                                        game.countPlayer(function (current) {
                                            current.addSkill('kangqin_shaqiuzhibian');
                                        });
                                        break;
                                    case '赵姬之乱':
                                        game.countPlayer(function (current) {
                                            current.addSkill('kangqin_zhaojizhiluan');
                                        });
                                        break;
                                    case '始称太后':
                                        game.countPlayer(function (current) {
                                            if (current.sex == 'female') {
                                                current.maxHp++;
                                                current.hp++;
                                                current.update();
                                            }
                                            current.addSkill('kangqin_shichengtaihou');
                                        });
                                        break;
                                }
                                game.me.chooseControl('ok').prompt = '###本局事件：' + name + '###' + game.eventInfo[name];
                            },
                        },
                        lib: {
                            card: {
                                shangyangbianfa: {
                                    image: 'ext:活动萌扩/image/shangyangbianfa.jpg',
                                    audio: true,
                                    global: 'shangyangbianfa_dying',
                                    type: 'trick',
                                    enable: true,
                                    filterTarget: lib.filter.notMe,
                                    content() {
                                        target.damage([1, 2].randomGet()).type = 'shangyangbianfa';
                                    },
                                    ai: {
                                        basic: {
                                            order: 5,
                                            useful: 1,
                                            value: 5.5,
                                        },
                                        result: {
                                            target: -1.5,
                                        },
                                        tag: {
                                            damage: 1,
                                        },
                                    },
                                    fullimage: true,
                                },
                                zhenlongchangjian: {
                                    type: 'equip',
                                    subtype: 'equip1',
                                    distance: {
                                        attackFrom: -1,
                                    },
                                    ai: {
                                        basic: {
                                            equipValue: 2,
                                        },
                                    },
                                    skills: ['zhenlongchangjian_skill'],
                                    image: 'ext:活动萌扩/image/zhenlongchangjian.jpg',
                                    enable: true,
                                    fullimage: true,
                                },
                                chuanguoyuxi: {
                                    image: 'ext:活动萌扩/image/chuanguoyuxi.jpg',
                                    type: 'equip',
                                    subtype: 'equip5',
                                    ai: {
                                        basic: {
                                            equipValue: 7.5,
                                        },
                                    },
                                    skills: ['chuanguoyuxi_skill'],
                                    enable: true,
                                    fullimage: true,
                                },
                                qinnu: {
                                    image: 'ext:活动萌扩/image/qinnu.jpg',
                                    vanish: true,
                                    type: 'equip',
                                    subtype: 'equip1',
                                    skills: ['qinnu_skill'],
                                    destroy: 'daqin_nushou',
                                    distance: { attackFrom: -8 },
                                    enable: true,
                                    ai: {
                                        basic: {
                                            useful: 2,
                                            equipValue: 1,
                                        },
                                    },
                                    fullimage: true,
                                },
                            },
                            character: (() => {
                                const character = {
                                    daqin_zhangyi: ['male', 'daqin', 4, ['zhangyi_lianheng', 'zhangyi_xichu', 'zhangyi_xiongbian', 'zhangyi_qiaoshe'], ['die:ext:活动萌扩/audio:true']],
                                    daqin_zhaogao: ['male', 'daqin', 3, ['zhaogao_zhilu', 'zhaogao_gaizhao', 'zhaogao_haizhong', 'zhaogao_aili'], ['die:ext:活动萌扩/audio:true']],
                                    daqin_yingzheng: ['male', 'daqin', 4, ['yingzheng_yitong', 'yingzheng_shihuang', 'yingzheng_zulong', 'yingzheng_fenshu'], ['die:ext:活动萌扩/audio:true']],
                                    daqin_shangyang: ['male', 'daqin', 4, ['shangyang_bianfa', 'shangyang_limu', 'shangyang_kencao'], ['die:ext:活动萌扩/audio:true']],
                                    daqin_nushou: ['male', 'daqin', 3, ['daqin_tongpao', 'nushou_jinnu'], ['die:ext:活动萌扩/audio:true']],
                                    daqin_qibing: ['male', 'daqin', 3, ['daqin_tongpao', 'qibing_changjian', 'qibing_liangju'], ['die:ext:活动萌扩/audio:true']],
                                    daqin_bubing: ['male', 'daqin', 4, ['daqin_tongpao', 'bubing_fangzhen', 'bubing_changbing'], ['die:ext:活动萌扩/audio:true']],
                                    daqin_baiqi: ['male', 'daqin', 4, ['baiqi_wuan', 'baiqi_shashen', 'baiqi_fachu', 'baiqi_changsheng'], ['die:ext:活动萌扩/audio:true']],
                                    daqin_miyue: ['female', 'daqin', 3, ['miyue_zhangzheng', 'miyue_taihou', 'miyue_youmie', 'miyue_yintui'], ['die:ext:活动萌扩/audio:true']],
                                    daqin_lvbuwei: ['male', 'daqin', 3, ['lvbuwei_jugu', 'lvbuwei_qihuo', 'lvbuwei_chunqiu', 'lvbuwei_baixiang'], ['die:ext:活动萌扩/audio:true']],
                                    daqin_zhaoji: ['female', 'daqin', 3, ['zhaoji_shanwu', 'zhaoji_daqi', 'zhaoji_xianji', 'zhaoji_huoluan'], ['die:ext:活动萌扩/audio:true']],
                                    hezongkangqin_player: ['male', 'key', 3, []],
                                    daqin_alpha0: ['male', 'key', 1, []],
                                    daqin_alpha1: ['male', 'key', 1, []],
                                    daqin_alpha2: ['male', 'key', 1, []],
                                    daqin_alpha3: ['male', 'key', 1, []],
                                    daqin_alpha4: ['male', 'key', 1, []],
                                    daqin_random1: ['male', 'key', 1, []],
                                    daqin_random2: ['male', 'key', 1, []],
                                    bol_unknown_male6: ['male', 'key', 3, []],
                                    bol_unknown_male1: ['male', 'key', 3, []],
                                    bol_unknown_male2: ['male', 'key', 3, []],
                                    bol_unknown_male3: ['male', 'key', 3, []],
                                    bol_unknown_male4: ['male', 'key', 3, []],
                                    bol_unknown_male5: ['male', 'key', 3, []],
                                    bol_unknown_female6: ['female', 'key', 3, []],
                                    bol_unknown_female1: ['female', 'key', 3, []],
                                    bol_unknown_female2: ['female', 'key', 3, []],
                                    bol_unknown_female3: ['female', 'key', 3, []],
                                    bol_unknown_female4: ['female', 'key', 3, []],
                                    bol_unknown_female5: ['female', 'key', 3, []],
                                };
                                for (const name in character) {
                                    character[name][4] ??= [];
                                    character[name][4].addArray(['forbidai', `ext:活动萌扩/image/${name}.jpg`]);
                                }
                                return character;
                            })(),
                            characterIntro: {
                                daqin_shangyang: '商鞅（约公元前395年－公元前338年），姬姓，公孙氏，名鞅，卫国人。战国时期政治家、改革家、思想家，法家代表人物，卫国国君后代。商鞅辅佐秦孝公，积极实行变法，使秦国成为富裕强大的国家，史称“商鞅变法”。政治上，改革了秦国户籍、军功爵位、土地制度、行政区划、税收、度量衡以及民风民俗，并制定了严酷的法律；经济上，主张重农抑商、奖励耕战；军事上，统率秦军收复了河西之地，赐予商于十五邑，号为商君，史称为商鞅。公元前338年，秦孝公逝世后，商鞅被公子虔指为谋反，战败死于彤地，尸身车裂，全家被杀。',
                                daqin_zhangyi: '张仪（？－前309年），姬姓，张氏，名仪，魏国安邑（今山西万荣县王显乡张仪村）人。魏国贵族后裔，战国时期著名的纵横家、外交家和谋略家。早年入于鬼谷子门下，学习纵横之术。出山之后，首创“连横”的外交策略，游说六国入秦。得到秦惠王赏识，封为相国，奉命出使游说各国，以“横”破“纵”，促使各国亲善秦国，受封为武信君。公元前310年，秦惠王死后，秦武王继位。张仪失去宠信，出逃魏国，担任相国，次年去世。',
                                daqin_miyue: '宣太后（？―前265年），芈（mǐ）姓，出生地楚国丹阳（在今湖北省），又称芈八子、秦宣太后。战国时期秦国王太后，秦惠文王之妾，秦昭襄王之母。秦昭襄王即位之初，宣太后以太后之位主政，执政期间，攻灭义渠国，一举灭亡了秦国的西部大患。死后葬于芷阳骊山。',
                                daqin_baiqi: '白起（？—公元前257年），秦国白氏，名起，郿邑（今陕西眉县常兴镇白家村）人。战国时期杰出的军事家、“兵家”代表人物。熟知兵法，善于用兵，交好秦宣太后，和穰侯魏冉的关系很好。辅佐秦昭王，屡立战功。伊阕之战，大破魏韩联军；伐楚之战，攻陷楚都郢城。长平之战，重创赵国主力。担任秦军主将30多年，攻城70余座，为秦国统一六国做出了巨大的贡献，受封为武安君。功高震主，得罪应侯，接连贬官。秦昭襄王五十年（前257年），赐死于杜邮。作为中国历史上继孙武、吴起之后又一个杰出的军事家、统帅，白起与廉颇、李牧、王翦并称为战国四大名将，并且被列为战国四大名将之首，名列武庙十哲。',
                                daqin_zhaoji: '赵姬（？―公元前228年），秦始皇生母，秦庄襄王的王后，赵国邯郸人。一说原为吕不韦姬妾，被吕不韦献给秦国质子异人，一说为赵豪家女，于公元前259年生秦始皇嬴政，异人立其为夫人。其子嬴政即位为秦王，她成为王太后，秦始皇统一天下，追尊其为帝太后，与秦庄襄王合葬于芷阳。',
                                daqin_lvbuwei: '吕不韦（？—前235年），姜姓，吕氏，名不韦，卫国濮阳（今河南省滑县）人。战国末年商人、政治家、思想家，秦国丞相，姜子牙23世孙。早年经商于阳翟，扶植秦国质子异人回国即位，成为秦庄襄王，拜为相国，封文信侯，食邑河南洛阳十万户。带兵攻取周国、赵国、卫国土地，分别设立三川郡、太原郡、东郡，对秦王嬴政兼并六国的事业作出重大贡献。庄襄王去世后，迎立太子嬴政即位，拜为相邦，尊称“仲父”，权倾天下。受到嫪毐集团叛乱牵连，罢相归国，全家流放蜀郡，途中饮鸩自尽。主持编纂《吕氏春秋》（又名《吕览》），包含八览、六论、十二纪，汇合了先秦诸子各派学说，“兼儒墨，合名法”，史称“杂家”。',
                                daqin_yingzheng: '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙等。秦庄襄王和赵姬之子。中国古代政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。秦始皇出生于赵国都城邯郸（今邯郸），后回到秦国。前247年，13岁时即王位。前238年，平定长信侯嫪毐的叛乱，之后又除掉权臣吕不韦，开始亲政。重用李斯、尉缭，自前230年至前221年，先后灭韩、赵、魏、楚、燕、齐六国，完成了统一中国大业，建立起一个中央集权的统一的多民族国家——秦朝。秦始皇认为自己的功劳胜过之前的三皇五帝，采用三皇之“皇”、五帝之“帝”构成“皇帝”的称号，是中国历史上第一个使用“皇帝”称号的君主，所以自称“始皇帝”。同时在中央实行三公九卿，管理国家大事。地方上废除分封制，代以郡县制，同时书同文，车同轨，统一度量衡。对外北击匈奴，南征百越，修筑万里长城，修筑灵渠，沟通水系。但是到了晚年，求仙梦想长生，苛政虐民，扼杀民智，动摇了秦朝统治的根基，前210年，秦始皇东巡途中驾崩于邢台沙丘。秦始皇奠定中国两千余年政治制度基本格局，被明代思想家李贽誉为“千古一帝”。',
                                daqin_zhaogao: '赵高（？－前207年），嬴姓，赵氏。秦朝二世皇帝时丞相，任中车府令，兼行符玺令事，“管事二十余年”。秦始皇死后，赵高发动沙丘政变，他与丞相李斯合谋伪造诏书，逼秦始皇长子扶苏自杀，另立始皇幼子胡亥为帝，是为秦二世，并自任郎中令。他在任职期间独揽大权，结党营私，征役更加繁重，行政更加苛暴。公元前208年又设计害死李斯，继之为秦朝丞相。第三年他迫秦二世自杀，另立子婴为秦王。不久被子婴设计杀掉，诛夷三族。',
                            },
                            skill: {
                                kangqin_hezonglianheng: {
                                    trigger: { global: 'roundStart' },
                                    forced: true,
                                    forceDie: true,
                                    content() {
                                        game.countPlayer(function (current) {
                                            current.link(true);
                                        });
                                    },
                                    charlotte: true,
                                },
                                kangqin_changpingzhizhan: {
                                    inherit: 'wushuang1',
                                    silent: true,
                                    popup: false,
                                    charlotte: true,
                                    group: 'kangqin_changpingzhizhan_gain',
                                    subSkill: {
                                        gain: {
                                            trigger: { player: 'phaseBeginStart' },
                                            forced: true,
                                            popup: false,
                                            filter(event, player) {
                                                return (
                                                    player.group == 'daqin' &&
                                                    game.hasPlayer(function (current) {
                                                        return current.name == 'daqin_baiqi';
                                                    })
                                                );
                                            },
                                            content() {
                                                var card = get.cardPile(function (card) {
                                                    return card.name == 'tao';
                                                });
                                                if (card) {
                                                    player.$gain2(card);
                                                    game.log(player, '获得了', card);
                                                    player.gain(card);
                                                }
                                            },
                                        },
                                    },
                                },
                                kangqin_shichengtaihou: {
                                    trigger: { player: 'phaseBeginStart' },
                                    forced: true,
                                    popup: false,
                                    charlotte: true,
                                    filter(event, player) {
                                        return (
                                            player.sex == 'male' &&
                                            game.hasPlayer(function (current) {
                                                return current.name == 'daqin_miyue';
                                            })
                                        );
                                    },
                                    content() {
                                        'step 0';
                                        var target = game.findPlayer(function (current) {
                                            return current.name == 'daqin_miyue';
                                        });
                                        event.target = target;
                                        if (target.isHealthy()) event._result = { control: '摸牌' };
                                        else
                                            player.chooseControl('摸牌', '回血').set('prompt', '始称太后：令芈月回复1点体力或摸一张牌').ai = function () {
                                                if (get.attitude(player, target) > 0) return '回血';
                                                return '摸牌';
                                            };
                                        'step 1';
                                        player.line(target);
                                        target[result.control == '摸牌' ? 'draw' : 'recover']();
                                    },
                                },
                                kangqin_lvshichunqiu: {
                                    trigger: { player: ['gainEnd', 'phaseDrawBegin'] },
                                    forced: true,
                                    popup: false,
                                    charlotte: true,
                                    filter(event, player, name) {
                                        if (name == 'phaseDrawBegin') return player.sex == 'male';
                                        return _status.currentPhase != player && player.name == 'daqin_lvbuwei' && (event.animate == 'draw' || event.getParent().name == 'draw') && event.getParent(2).name != 'kangqin_lvshichunqiu';
                                    },
                                    content() {
                                        if (trigger.name == 'phaseDraw') trigger.num++;
                                        else player.draw('nodelay');
                                    },
                                },
                                kangqin_zhaojizhiluan: {
                                    trigger: { source: 'damageBegin3' },
                                    forced: true,
                                    silent: true,
                                    popup: false,
                                    charlotte: true,
                                    usable: 1,
                                    filter(event, player) {
                                        if (player.sex != 'male') return false;
                                        return (
                                            player.group != 'daqin' ||
                                            !game.hasPlayer(function (current) {
                                                return current.name == 'daqin_zhaoji';
                                            })
                                        );
                                    },
                                    content() {
                                        trigger.player.draw();
                                    },
                                },
                                _kangqin_level_buff: {
                                    mod: {
                                        cardUsable(card, player, num) {
                                            if (card.name == 'sha' && player._kangqinLevel && player._kangqinLevel > 2) {
                                                return num + 1;
                                            }
                                        },
                                    },
                                    trigger: {
                                        global: 'gameDrawAfter',
                                        player: 'phaseDrawBegin',
                                    },
                                    filter(event, player) {
                                        var level = player._kangqinLevel;
                                        return level && level > (event.name == 'gameDraw' ? 1 : 3);
                                    },
                                    forced: true,
                                    popup: false,
                                    content() {
                                        if (trigger.name == 'gameDraw') {
                                            var card = get.cardPile(function (card) {
                                                return get.type(card) == 'equip';
                                            });
                                            if (card) player.chooseUseTarget(card, true, 'nopopup', 'noanimate');
                                        } else trigger.num++;
                                    },
                                },
                                kangqin_shaqiuzhibian: {
                                    trigger: { player: 'die' },
                                    forced: true,
                                    popup: false,
                                    forceDie: true,
                                    filter(event, player) {
                                        return (
                                            game.hasPlayer(function (current) {
                                                return current.name == 'daqin_zhaogao' || current.sex == 'male';
                                            }) && player.countCards('he') > 0
                                        );
                                    },
                                    content() {
                                        var cards = player.getCards('he');
                                        var zhaogao = game.findPlayer(function (current) {
                                            return current.name == 'daqin_zhaogao';
                                        });
                                        if (zhaogao) zhaogao.gain(cards, player, 'giveAuto');
                                        else {
                                            var list = [];
                                            var list2 = [];
                                            game.countPlayer(function (current) {
                                                if (current.sex == 'male') {
                                                    list.push(current);
                                                    list2.push([]);
                                                }
                                            });
                                            while (cards.length) {
                                                list2.randomGet().push(cards.shift());
                                            }
                                            while (list.length) {
                                                var current = list.shift();
                                                var current2 = list2.shift();
                                                if (current2.length) {
                                                    current.gain(current2, player);
                                                    player.$giveAuto(current2, current);
                                                }
                                            }
                                        }
                                    },
                                },
                                //角色技能
                                zhaogao_zhilu: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    group: 'zhaogao_zhilu2',
                                    enable: ['chooseToUse', 'chooseToRespond'],
                                    viewAs: { name: 'sha' },
                                    filterCard: { color: 'black' },
                                    check(card) {
                                        return 1 / (get.value(card) || 0.5);
                                    },
                                    viewAsFilter(player) {
                                        return player.countCards('h', { color: 'black' }) > 0;
                                    },
                                    ai: {
                                        respondSha: true,
                                        skillTagFilter(player) {
                                            return player.countCards('h', { color: 'black' }) > 0;
                                        },
                                    },
                                },
                                zhaogao_zhilu2: {
                                    audio: 'zhaogao_zhilu',
                                    enable: ['chooseToUse', 'chooseToRespond'],
                                    viewAs: { name: 'shan' },
                                    filterCard: { color: 'red' },
                                    check(card) {
                                        return 1 / (get.value(card) || 0.5);
                                    },
                                    viewAsFilter(player) {
                                        return player.countCards('h', { color: 'red' }) > 0;
                                    },
                                    ai: {
                                        respondShan: true,
                                        skillTagFilter(player) {
                                            return player.countCards('h', { color: 'red' }) > 0;
                                        },
                                    },
                                },
                                zhaogao_gaizhao: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: { target: 'useCardToTarget' },
                                    direct: true,
                                    filter(event, player) {
                                        if (get.info(event.card).multitarget) return false;
                                        var type = get.type(event.card);
                                        if (type != 'basic' && type != 'trick') return false;
                                        return game.hasPlayer(function (current) {
                                            return current != player && current.group == 'daqin' && !event.targets.includes(current);
                                        });
                                    },
                                    content() {
                                        'step 0';
                                        player
                                            .chooseTarget(get.prompt(event.name), '将' + get.translation(trigger.card) + '转移给其他秦势力角色', function (card, player, target) {
                                                var trigger = _status.event.getTrigger();
                                                return target.group == 'daqin' && !trigger.targets.includes(target) && lib.filter.targetEnabled2(trigger.card, trigger.player, target);
                                            })
                                            .set('rawEffect', get.effect(player, trigger.card, trigger.player, player)).ai = function (target) {
                                                var trigger = _status.event.getTrigger();
                                                return 0.1 + get.effect(target, trigger.card, trigger.player, _status.event.player) - _status.event.rawEffect;
                                            };
                                        'step 1';
                                        if (result.bool) {
                                            var target = result.targets[0];
                                            player.logSkill(event.name, target);
                                            trigger.targets[trigger.targets.indexOf(player)] = target;
                                        }
                                    },
                                },
                                zhaogao_haizhong: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    intro: {
                                        content: 'mark',
                                    },
                                    trigger: { global: 'recoverAfter' },
                                    forced: true,
                                    filter(event, player) {
                                        return event.player.group != 'daqin';
                                    },
                                    logTarget: 'player',
                                    content() {
                                        'step 0';
                                        if (!trigger.player.storage[event.name]) trigger.player.storage[event.name] = 0;
                                        event.num = Math.max(1, trigger.player.storage[event.name]);
                                        trigger.player.storage[event.name]++;
                                        trigger.player.markSkill(event.name);
                                        trigger.player.chooseToDiscard('害忠：弃置一张红色牌，或受到' + event.num + '点伤害', { color: 'red' }).ai = lib.skill.shangyang_bianfa.check;
                                        'step 1';
                                        if (!result.bool) trigger.player.damage(num);
                                    },
                                },
                                zhaogao_aili: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: { player: 'phaseUseBegin' },
                                    forced: true,
                                    content() {
                                        var list = [];
                                        for (var i = 0; i < 2; i++) {
                                            var cardx = get.cardPile2(function (card) {
                                                return get.type(card) == 'trick' && !list.includes(card);
                                            });
                                            if (cardx) list.push(cardx);
                                        }
                                        if (list.length) player.gain(list, 'draw');
                                    },
                                },
                                zhangyi_lianheng: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        player: 'phaseBegin',
                                    },
                                    forced: true,
                                    content() {
                                        var list = game.filterPlayer(function (current) {
                                            current.removeSkill('zhangyi_lianheng_mark');
                                            return current.group != 'daqin';
                                        });
                                        if (list.length > 1) {
                                            var target = list.randomGet();
                                            player.line(target);
                                            target.addSkill('zhangyi_lianheng_mark');
                                        }
                                    },
                                    group: 'zhangyi_lianheng_init',
                                    subSkill: {
                                        mark: {
                                            charlotte: true,
                                            mod: {
                                                playerEnabled(card, player, target) {
                                                    if (target.group == 'daqin' || (_status.kangqinEvent == '合纵连横' && target.isLinked())) return false;
                                                },
                                            },
                                            marktext: '横',
                                            mark: true,
                                            intro: {
                                                content() {
                                                    if (_status.kangqinEvent == '合纵连横') return '不能对秦势力角色和已横置的角色使用牌';
                                                    return '不能对秦势力角色使用牌';
                                                },
                                            },
                                        },
                                        init: {
                                            audio: 'ext:活动萌扩/audio:true',
                                            trigger: { global: 'gameDrawAfter' },
                                            forced: true,
                                            content() {
                                                var list = game.filterPlayer(function (current) {
                                                    return current.group != 'daqin';
                                                });
                                                if (list.length) {
                                                    var target = list.randomGet();
                                                    player.line(target);
                                                    target.addSkill('zhangyi_lianheng_mark');
                                                }
                                            },
                                        },
                                    },
                                },
                                zhangyi_xichu: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: { target: 'useCardToTarget' },
                                    forced: true,
                                    filter(event, player) {
                                        return (
                                            event.card.name == 'sha' &&
                                            game.hasPlayer(function (current) {
                                                return current != player && current != event.player && lib.filter.targetInRange(event.card, event.player, current);
                                            })
                                        );
                                    },
                                    content() {
                                        'step 0';
                                        trigger.player.chooseToDiscard('戏楚：弃置一张点数为6的牌，或令' + get.translation(player) + '将此【杀】转移', function (card) {
                                            return get.number(card) == 6;
                                        }).ai = function (card) {
                                            return 100 - get.value(card);
                                        };
                                        'step 1';
                                        if (!result.bool) {
                                            player.chooseTarget(true, '将此【杀】转移给' + get.translation(trigger.player) + '攻击范围内的一名角色', true, function (card, player, target) {
                                                var trigger = _status.event.getTrigger();
                                                return target != player && target != trigger.player && !trigger.targets.includes(target) && lib.filter.targetInRange(trigger.card, trigger.player, target);
                                            }).ai = function (target) {
                                                var trigger = _status.event.getTrigger();
                                                return get.effect(target, trigger.card, trigger.player, _status.event.player);
                                            };
                                        } else event.finish();
                                        'step 2';
                                        if (result.bool) {
                                            player.line(result.targets[0]);
                                            trigger.targets[trigger.targets.indexOf(player)] = result.targets[0];
                                        }
                                    },
                                    ai: {
                                        effect: {
                                            target(card, player, target) {
                                                if (
                                                    card.name == 'sha' &&
                                                    !player.countCards('h', { number: 6 }) &&
                                                    game.hasPlayer(function (current) {
                                                        return current != player && current != target && lib.filter.targetInRange(card, player, current);
                                                    })
                                                )
                                                    return 'zeroplayertarget';
                                            },
                                        },
                                    },
                                },
                                zhangyi_xiongbian: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: { target: 'useCardToTargeted' },
                                    forced: true,
                                    filter(event, player) {
                                        return get.type(event.card) == 'trick';
                                    },
                                    content() {
                                        'step 0';
                                        player
                                            .judge(function (result) {
                                                if (result.number == 6) return 1;
                                                return -1;
                                            })
                                            .set('no6', get.attitude(player, trigger.player) > 0);
                                        'step 1';
                                        if (result.bool) trigger.getParent().cancel();
                                        game.broadcastAll(ui.clear);
                                    },
                                },
                                zhangyi_qiaoshe: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        global: 'judge',
                                    },
                                    direct: true,
                                    content() {
                                        'step 0';
                                        var card = trigger.player.judging[0];
                                        var judge0 = trigger.judge(card);
                                        var judge1 = 0;
                                        var choice = trigger.no6 && card.number == 6 ? '+1' : 'cancel2';
                                        var attitude = get.attitude(player, trigger.player);
                                        var list = [];
                                        for (var i = -3; i < 4; i++) {
                                            if (i == 0) continue;
                                            list.push((i > 0 ? '+' : '') + i);
                                            if (!trigger.no6) {
                                                var judge2 =
                                                    (trigger.judge({
                                                        name: get.name(card),
                                                        suit: get.suit(card),
                                                        number: get.number(card) + i,
                                                        nature: get.nature(card),
                                                    }) -
                                                        judge0) *
                                                    attitude;
                                                if (judge2 > judge1) {
                                                    choice = (i > 0 ? '+' : '') + i;
                                                    judge1 = judge2;
                                                }
                                            }
                                        }
                                        list.push('cancel2');
                                        player
                                            .chooseControl(list)
                                            .set('ai', function () {
                                                return _status.event.choice;
                                            })
                                            .set('choice', choice).prompt = get.prompt2(event.name);
                                        'step 1';
                                        if (result.control != 'cancel2') {
                                            player.logSkill(event.name, trigger.player);
                                            game.log(trigger.player, '判定结果点数', '#g' + result.control);
                                            player.popup(result.control, 'fire');
                                            if (!trigger.fixedResult) trigger.fixedResult = {};
                                            if (!trigger.fixedResult.number) trigger.fixedResult.number = get.number(trigger.player.judging[0]);
                                            trigger.fixedResult.number += parseInt(result.control);
                                        }
                                    },
                                },
                                yingzheng_yitong: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    mod: {
                                        targetInRange(card) {
                                            if (card.name == 'sha' || card.name == 'shunshou') return true;
                                        },
                                    },
                                    trigger: { player: ['useCard2', 'useCardToPlayer'] },
                                    forced: true,
                                    filter(event, player) {
                                        if (!['shunshou', 'guohe', 'sha', 'huogong'].includes(event.card.name)) return false;
                                        return game.hasPlayer(function (current) {
                                            return current.group != 'daqin' && !event.targets.includes(current);
                                        });
                                    },
                                    content() {
                                        trigger.targets.addArray(
                                            game.filterPlayer(function (current) {
                                                return current.group != 'daqin' && !trigger.targets.includes(current);
                                            })
                                        );
                                        player.line(trigger.targets);
                                    },
                                },
                                yingzheng_shihuang: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        global: 'phaseAfter',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        var num = (game.roundNumber / 100) * 6;
                                        if (num > 1) num = 1;
                                        return event.player != player && Math.random() <= num;
                                    },
                                    content() {
                                        player.insertPhase();
                                    },
                                },
                                yingzheng_zulong: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        player: 'phaseBegin',
                                    },
                                    forced: true,
                                    content() {
                                        var list = [];
                                        var card1 = get.cardPile2(function (card) {
                                            return card.name == 'zhenlongchangjian';
                                        });
                                        var card2 = get.cardPile2(function (card) {
                                            return card.name == 'chuanguoyuxi';
                                        });
                                        if (card1 && !player.countCards('he', 'zhenlongchangjian')) {
                                            list.push(card1);
                                        }
                                        if (card2 && !player.countCards('he', 'chuanguoyuxi')) {
                                            list.push(card2);
                                        }
                                        if (list.length > 0) {
                                            player.gain(list, 'gain2');
                                        } else {
                                            player.draw(2);
                                        }
                                    },
                                },
                                yingzheng_fenshu: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        global: 'useCard',
                                    },
                                    usable: 1,
                                    forced: true,
                                    filter(event, player) {
                                        if (event.player == _status.currentPhase && event.player.group != 'daqin' && get.type(event.card) == 'trick') {
                                            return true;
                                        }
                                        return false;
                                    },
                                    content() {
                                        trigger.cancel();
                                        game.delay();
                                        game.broadcastAll(ui.clear);
                                    },
                                },
                                zhenlongchangjian_skill: {
                                    trigger: {
                                        player: 'useCard',
                                    },
                                    forced: true,
                                    usable: 1,
                                    filter(event) {
                                        return get.type(event.card) == 'trick';
                                    },
                                    content() {
                                        trigger.nowuxie = true;
                                    },
                                },
                                chuanguoyuxi_skill: {
                                    trigger: {
                                        player: 'phaseUseBegin',
                                    },
                                    direct: true,
                                    content() {
                                        'step 0';
                                        var list = ['nanman', 'wanjian', 'taoyuan', 'wugu'];
                                        player.chooseButton([get.prompt(event.name), [list, 'vcard']], true).ai = function (button) {
                                            var name = button.link[2];
                                            return name == 'nanman' ? 0.8 : 0 || name == 'wanjian' ? 0.8 : 0;
                                        };
                                        'step 1';
                                        if (result.bool) {
                                            player.chooseUseTarget(result.links[0][2], true, false).logSkill = event.name;
                                        }
                                    },
                                },
                                qinnu_skill: {
                                    mod: {
                                        cardUsable(card, player, num) {
                                            if (card.name == 'sha') {
                                                return num + 1;
                                            }
                                        },
                                    },
                                    inherit: 'qinggang_skill',
                                },
                                shangyang_bianfa: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    mod: {
                                        selectTarget(card, player, range) {
                                            if (_status.kangqinEvent == '变法图强' && card.name == 'shangyangbianfa' && range[1] != -1) range[1]++;
                                        },
                                    },
                                    enable: 'chooseToUse',
                                    usable: 1,
                                    filterCard(card) {
                                        return get.type(card) == 'trick';
                                    },
                                    viewAs: {
                                        name: 'shangyangbianfa',
                                    },
                                    viewAsFilter(player) {
                                        if (!player.countCards('h', { type: 'trick' })) return false;
                                    },
                                    prompt: '将一张普通锦囊牌当作【商鞅变法】使用',
                                    check(card) {
                                        return 9 - get.value(card);
                                    },
                                    ai: {
                                        basic: {
                                            order: 10,
                                            useful: 1,
                                            value: 5.5,
                                        },
                                        result: {
                                            target: -1.5,
                                        },
                                        tag: {
                                            damage: 1,
                                        },
                                    },
                                },
                                shangyang_limu: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        player: 'useCard',
                                    },
                                    forced: true,
                                    filter(event) {
                                        return get.type(event.card) == 'trick';
                                    },
                                    content() {
                                        trigger.nowuxie = true;
                                    },
                                },
                                shangyang_kencao: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    init(player) {
                                        if (!player.storage.shangyang_kencao) player.storage.shangyang_kencao = 0;
                                    },
                                    marktext: '功',
                                    intro: {
                                        content: '当前有#个“功”标记',
                                    },
                                    trigger: {
                                        global: 'damageAfter',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return event.source && event.source.group == 'daqin' && event.source.isAlive();
                                    },
                                    content() {
                                        if (trigger.source == player) {
                                            player.markSkill('shangyang_kencao');
                                            player.storage.shangyang_kencao += trigger.num;
                                            player.syncStorage('shangyang_kencao');
                                            game.log(player, '获得了', trigger.num, '个“功”标记');
                                            if (player.storage.shangyang_kencao >= 3) {
                                                game.log(player, '移去了', player.storage.shangyang_kencao, '个“功”标记');
                                                player.storage.shangyang_kencao = 0;
                                                player.syncStorage('shangyang_kencao');
                                                if (player.storage.shangyang_kencao <= 0) player.unmarkSkill('shangyang_kencao');
                                                player.gainMaxHp();
                                                player.recover();
                                            }
                                        } else {
                                            player.line(trigger.source);
                                            if (trigger.source.storage.shangyang_kencao == undefined) trigger.source.storage.shangyang_kencao = 0;
                                            trigger.source.markSkill('shangyang_kencao');
                                            trigger.source.storage.shangyang_kencao += trigger.num;
                                            trigger.source.syncStorage('shangyang_kencao');
                                            game.log(trigger.source, '获得了', trigger.num, '个“功”标记');
                                            if (trigger.source.storage.shangyang_kencao >= 3) {
                                                game.log(trigger.source, '移去了', trigger.source.storage.shangyang_kencao, '个“功”标记');
                                                trigger.source.storage.shangyang_kencao = 0;
                                                trigger.source.syncStorage('shangyang_kencao');
                                                if (trigger.source.storage.shangyang_kencao <= 0) trigger.source.unmarkSkill('shangyang_kencao');
                                                trigger.source.gainMaxHp();
                                                trigger.source.recover();
                                            }
                                        }
                                    },
                                },
                                shangyangbianfa_dying: {
                                    trigger: {
                                        player: 'dying',
                                    },
                                    forced: true,
                                    popup: false,
                                    direct: true,
                                    charlotte: true,
                                    locked: true,
                                    filter(event, player) {
                                        return event.getParent().type == 'shangyangbianfa';
                                    },
                                    content() {
                                        'step 0';
                                        player.judge(function (card) {
                                            return get.color(card) == 'black' ? -1 : 0;
                                        });
                                        'step 1';
                                        if (result.color == 'black') {
                                            game.countPlayer(function (current) {
                                                if (current != player) current.addTempSkill('shangyangbianfa_dying_nosave', '_saveAfter');
                                            });
                                        }
                                    },
                                    subSkill: {
                                        nosave: {
                                            mod: {
                                                cardSavable() {
                                                    return false;
                                                },
                                            },
                                        },
                                    },
                                },
                                nushou_jinnu: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        player: 'phaseBegin',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return !player.getEquip('qinnu');
                                    },
                                    content() {
                                        var card = game.createCard('qinnu', Math.random() < 0.5 ? 'diamond' : 'club', 1);
                                        player.chooseUseTarget(card, true);
                                    },
                                },
                                qibing_changjian: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    mod: {
                                        attackFrom(from, to, distance) {
                                            return distance - 1;
                                        },
                                    },
                                    trigger: {
                                        player: 'useCard2',
                                    },
                                    filter(event, player) {
                                        return event.card && event.card.name == 'sha';
                                    },
                                    forced: true,
                                    content() {
                                        'step 0';
                                        player
                                            .chooseTarget(get.prompt('qibing_changjian'), '为' + get.translation(trigger.card) + '增加一个目标，或取消并令' + get.translation(trigger.card) + '伤害＋1', function (card, player, target) {
                                                return !_status.event.sourcex.includes(target) && player.canUse('sha', target);
                                            })
                                            .set('sourcex', trigger.targets)
                                            .set('ai', function (target) {
                                                var player = _status.event.player;
                                                return get.effect(target, { name: 'sha' }, player, player);
                                            });
                                        'step 1';
                                        if (result.bool) {
                                            if (!event.isMine() && !_status.connectMode) game.delayx();
                                            event.target = result.targets[0];
                                            player.line(event.target);
                                            trigger.targets.push(event.target);
                                        } else {
                                            if (!trigger.baseDamage) ttrigger.baseDamage = 1;
                                            trigger.baseDamage++;
                                        }
                                    },
                                },
                                qibing_liangju: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        player: 'useCardToPlayered',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return event.card.name == 'sha';
                                    },
                                    content() {
                                        'step 0';
                                        trigger.target
                                            .judge(function (card) {
                                                return get.suit(card) == 'spade' ? -2 : 0;
                                            })
                                            .set('judge2', result => (result.bool === false ? true : false));
                                        'step 1';
                                        if (result.judge < 0) {
                                            trigger.getParent().directHit.add(trigger.target);
                                        }
                                    },
                                    group: ['qibing_liangju_judge'],
                                    subSkill: {
                                        judge: {
                                            audio: 'qibing_liangju',
                                            trigger: {
                                                target: 'useCardToTargeted',
                                            },
                                            filter(event, player) {
                                                if (event.player == player) return false;
                                                if (event.card.name == 'sha') return true;
                                                return false;
                                            },
                                            forced: true,
                                            content() {
                                                'step 0';
                                                player.judge(function (card) {
                                                    return get.suit(card) == 'heart' ? 2 : -1;
                                                });
                                                'step 1';
                                                if (result.judge > 0) {
                                                    trigger.getParent().excluded.add(player);
                                                }
                                            },
                                        },
                                    },
                                },
                                bubing_fangzhen: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        target: 'useCardToTargeted',
                                    },
                                    filter(event, player) {
                                        if (event.player.group == 'daqin' || event.player == player) return false;
                                        if ((event.card.name == 'sha' || get.type(event.card) == 'trick') && get.distance(event.player, player, 'attack') <= 1) return true;
                                        return false;
                                    },
                                    forced: true,
                                    content() {
                                        'step 0';
                                        player.judge(function (card) {
                                            return get.color(card) == 'black' ? 2 : -1;
                                        });
                                        'step 1';
                                        if (result.judge > 0) {
                                            player.useCard({ name: 'sha' }, trigger.player, false);
                                        }
                                    },
                                },
                                bubing_changbing: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    mod: {
                                        attackFrom(from, to, distance) {
                                            return distance - 2;
                                        },
                                    },
                                },
                                daqin_tongpao: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: { global: 'useCardAfter' },
                                    filter(event, player) {
                                        if (event.player.group != 'daqin') return false;
                                        return event.player != player && !player.getEquips(2).length && get.subtype(event.card) == 'equip2';
                                    },
                                    forced: true,
                                    content() {
                                        var card = game.createCard2(trigger.card.name, trigger.card.suit, trigger.card.number);
                                        card._destroy = true;
                                        player.$gain2(card);
                                        game.delayx();
                                        player.equip(card);
                                    },
                                },
                                baiqi_wuan: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    firstDo: true,
                                    trigger: { global: 'useCard1' },
                                    forced: true,
                                    filter(event, player) {
                                        return !event.audioed && player.isAlive() && event.source && event.source.group == 'daqin' && event.card.name == 'sha' && player.countUsed('sha', true) > 1 && event.getParent().type == 'phase';
                                    },
                                    content() {
                                        trigger.audioed = true;
                                    },
                                    global: 'baiqi_wuan_buff',
                                    subSkill: {
                                        buff: {
                                            mod: {
                                                cardUsable(card, player, num) {
                                                    if (player.group == 'daqin' && card.name == 'sha') {
                                                        return num + 1;
                                                    }
                                                },
                                            },
                                            sub: true,
                                        },
                                    },
                                },
                                baiqi_shashen: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    enable: ['chooseToRespond', 'chooseToUse'],
                                    filterCard: true,
                                    viewAs: {
                                        name: 'sha',
                                    },
                                    viewAsFilter(player) {
                                        if (!player.countCards('h')) return false;
                                    },
                                    prompt: '将一张手牌当作【杀】使用或打出',
                                    check(card) {
                                        return 4 - get.value(card);
                                    },
                                    group: ['baiqi_shashen_i'],
                                    subSkill: {
                                        i: {
                                            trigger: {
                                                player: 'useCard2',
                                            },
                                            forced: true,
                                            direct: true,
                                            popup: false,
                                            usable: 1,
                                            filter(event, player) {
                                                return event.card.name == 'sha';
                                            },
                                            content() {
                                                player.addTempSkill('baiqi_shashen_d', 'useCardAfter');
                                            },
                                            sub: true,
                                        },
                                        d: {
                                            audio: 'baiqi_shashen',
                                            trigger: {
                                                source: 'damageSource',
                                            },
                                            filter(event, player) {
                                                return event.card && event.card.name == 'sha';
                                            },
                                            forced: true,
                                            content() {
                                                player.draw();
                                                player.removeSkill('baiqi_shashen_d');
                                            },
                                            sub: true,
                                        },
                                    },
                                    ai: {
                                        skillTagFilter(player) {
                                            if (!player.countCards('h')) return false;
                                        },
                                        respondSha: true,
                                    },
                                },
                                baiqi_fachu: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        global: 'dying',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return player.isAlive() && event.source == player && event.player.group != 'daqin' && event.player.countDisabled() < 5;
                                    },
                                    content() {
                                        var list = [];
                                        for (var i = 1; i < 5; i++) {
                                            if (trigger.player.isDisabled(i)) continue;
                                            list.push('equip' + i);
                                        }
                                        if (list.length) {
                                            player.line(trigger.player);
                                            trigger.player.disableEquip(list.randomGet());
                                        }
                                    },
                                },
                                baiqi_changsheng: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    mod: {
                                        targetInRange(card) {
                                            if (card.name == 'sha') return true;
                                        },
                                    },
                                },
                                miyue_zhangzheng: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        player: 'phaseBegin',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return game.hasPlayer(function (current) {
                                            return current != player && current.group != 'daqin';
                                        });
                                    },
                                    content() {
                                        'step 0';
                                        event.players = game.filterPlayer(function (current) {
                                            return current != player && current.group != 'daqin';
                                        });
                                        'step 1';
                                        if (event.players.length) {
                                            event.current = event.players.shift();
                                            player.line(event.current);
                                            if (event.current.countCards('h')) {
                                                event.current.chooseToDiscard('h', '弃置一张手牌或失去一点体力').set('ai', function (card) {
                                                    return 7 - get.value(card);
                                                });
                                                event.tempbool = false;
                                            } else {
                                                event.tempbool = true;
                                            }
                                        } else {
                                            event.finish();
                                        }
                                        'step 2';
                                        if (event.tempbool || result.bool == false) {
                                            event.current.loseHp();
                                        }
                                        event.goto(1);
                                    },
                                },
                                miyue_taihou: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        target: 'useCardToTargeted',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return event.player != player && event.player.sex == 'male' && event.card && (event.card.name == 'sha' || get.type(event.card) == 'trick');
                                    },
                                    content() {
                                        'step 0';
                                        player.line(trigger.player);
                                        var type = get.type(trigger.card, 'trick');
                                        var eff = get.effect(player, trigger.card, trigger.player, trigger.player);
                                        trigger.player
                                            .chooseToDiscard('弃置一张' + get.translation(type) + '牌，否则' + get.translation(trigger.card) + '对' + get.translation(player) + '无效', function (card) {
                                                return get.type(card, 'trick') == type;
                                            })
                                            .set('ai', function (card) {
                                                if (_status.event.eff > 0) {
                                                    return 10 - get.value(card);
                                                }
                                                return 0;
                                            })
                                            .set('type', type)
                                            .set('eff', eff);
                                        'step 1';
                                        if (!result.bool) {
                                            trigger.getParent().excluded.add(player);
                                        }
                                    },
                                },
                                miyue_youmie: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    prompt: '出牌阶段限一次，你可以将一张牌交给一名角色，若如此做，直到你的下个回合开始，该角色于其回合外无法使用或打出牌。',
                                    enable: 'phaseUse',
                                    usable: 1,
                                    filter(event, player) {
                                        return player.countCards('he') > 0;
                                    },
                                    discard: false,
                                    line: true,
                                    prepare: 'give',
                                    position: 'he',
                                    filterCard: true,
                                    filterTarget: true,
                                    check(card) {
                                        if (get.position(card) == 'e') return -1;
                                        return 5 - get.value(card);
                                    },
                                    content() {
                                        target.gain(cards, player);
                                        target.addSkill('miyue_youmie_debuff');
                                    },
                                    ai: {
                                        order: 1,
                                        result: {
                                            target(player, target) {
                                                return -1;
                                            },
                                        },
                                    },
                                    group: ['miyue_youmie_delete'],
                                    subSkill: {
                                        debuff: {
                                            mark: true,
                                            marktext: '灭',
                                            mod: {
                                                cardEnabled(card, player, target) {
                                                    if (_status.currentPhase != player) return false;
                                                },
                                                cardUsable(card, player, target) {
                                                    if (_status.currentPhase != player) return false;
                                                },
                                                cardRespondable(card, player, target) {
                                                    if (_status.currentPhase != player) return false;
                                                },
                                                cardSavable(card, player, target) {
                                                    if (_status.currentPhase != player) return false;
                                                },
                                            },
                                            intro: {
                                                content: '回合外不能使用或打出卡牌',
                                            },
                                            sub: true,
                                        },
                                        delete: {
                                            trigger: {
                                                player: 'phaseBegin',
                                            },
                                            forced: true,
                                            direct: true,
                                            popup: false,
                                            filter(event, player) {
                                                return game.hasPlayer(function (current) {
                                                    return current.hasSkill('miyue_youmie_debuff');
                                                });
                                            },
                                            content() {
                                                for (var i = 0; i < game.players.length; i++) {
                                                    if (game.players[i].hasSkill('miyue_youmie_debuff')) {
                                                        player.line(game.players[i]);
                                                        game.players[i].removeSkill('miyue_youmie_debuff');
                                                    }
                                                }
                                            },
                                            sub: true,
                                        },
                                    },
                                },
                                miyue_yintui: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        player: 'loseEnd',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        if (player.countCards('h')) return false;
                                        for (var i = 0; i < event.cards.length; i++) {
                                            if (event.cards[i].original == 'h') return true;
                                        }
                                        return false;
                                    },
                                    content() {
                                        player.turnOver();
                                    },
                                    ai: {
                                        noh: true,
                                        skillTagFilter(player, tag) {
                                            if (tag == 'noh') {
                                                if (player.countCards('h') != 1) return false;
                                            }
                                        },
                                    },
                                    group: ['miyue_yintui_damage'],
                                    subSkill: {
                                        damage: {
                                            audio: 'miyue_yintui',
                                            trigger: {
                                                player: 'damageBegin3',
                                            },
                                            forced: true,
                                            filter(event, player) {
                                                return player.isTurnedOver();
                                            },
                                            content() {
                                                trigger.num--;
                                                player.draw();
                                            },
                                            sub: true,
                                        },
                                    },
                                },
                                lvbuwei_jugu: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    mod: {
                                        maxHandcard(player, num) {
                                            return num + player.maxHp;
                                        },
                                    },
                                    trigger: {
                                        global: 'gameDrawAfter',
                                        player: 'enterGame',
                                    },
                                    forced: true,
                                    content() {
                                        player.draw(player.maxHp);
                                    },
                                },
                                lvbuwei_qihuo: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    enable: 'phaseUse',
                                    usable: 1,
                                    delay: 0,
                                    filter(event, player) {
                                        return player.countCards('h') > 0;
                                    },
                                    content() {
                                        'step 0';
                                        event.list = [];
                                        var hs = player.getCards('h');
                                        for (var i = 0; i < hs.length; i++) {
                                            var card = hs[i];
                                            if (event.list.includes(get.type(card, 'trick'))) continue;
                                            event.list.push(get.type(card, 'trick'));
                                        }
                                        'step 1';
                                        player.chooseControl(event.list, function (event, player) {
                                            return event.list.randomGet();
                                        }).prompt = '奇货：请选择一种类别';
                                        'step 2';
                                        var cards = player.getCards('h', function (card) {
                                            return get.type(card, 'trick') == result.control;
                                        });
                                        player.discard(cards);
                                        player.draw(cards.length);
                                    },
                                    ai: {
                                        order: 1,
                                        result: {
                                            player: 4,
                                        },
                                        threaten: 1.55,
                                    },
                                },
                                lvbuwei_chunqiu: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: { player: ['useCard', 'respond'] },
                                    filter(event, player) {
                                        return (
                                            game
                                                .getGlobalHistory('everything', evt => {
                                                    return evt.player === player && ['useCard', 'respond'].includes(evt.name);
                                                })
                                                .indexOf(event) === 0
                                        );
                                    },
                                    forced: true,
                                    content() {
                                        player.draw();
                                    },
                                },
                                lvbuwei_baixiang: {
                                    unique: true,
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: { player: 'phaseBegin' },
                                    filter(event, player) {
                                        return player.countCards('h') >= player.hp * 3;
                                    },
                                    forced: true,
                                    juexingji: true,
                                    skillAnimation: true,
                                    animationColor: 'thunfer',
                                    content() {
                                        'step 0';
                                        player.awakenSkill('lvbuwei_baixiang');
                                        'step 1';
                                        var num = player.maxHp - player.hp;
                                        if (num > 0) player.recover(num);
                                        'step 2';
                                        player.popup('lvbuwei_zhongfu');
                                        player.addSkills('lvbuwei_zhongfu');
                                    },
                                    derivation: ['lvbuwei_zhongfu', 'new_rejianxiong', 'rerende', 'rezhiheng'],
                                },
                                lvbuwei_zhongfu: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: { player: 'phaseBegin' },
                                    forced: true,
                                    content() {
                                        var skill = ['new_rejianxiong', 'rerende', 'rezhiheng'].randomGet();
                                        player.popup(skill);
                                        player.addTempSkills(skill, { player: 'phaseBegin' });
                                    },
                                },
                                zhaoji_shanwu: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        player: 'useCardToPlayered',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return event.card.name == 'sha';
                                    },
                                    content() {
                                        'step 0';
                                        player.judge(function (card) {
                                            return get.color(card) == 'black' ? 2 : 0;
                                        });
                                        'step 1';
                                        if (result.judge > 0) {
                                            trigger.getParent().directHit.add(trigger.target);
                                        }
                                    },
                                    group: ['zhaoji_shanwu_judge'],
                                    subSkill: {
                                        judge: {
                                            audio: 'zhaoji_shanwu',
                                            trigger: {
                                                target: 'useCardToTargeted',
                                            },
                                            filter(event, player) {
                                                if (event.player == player) return false;
                                                if (event.card.name == 'sha') return true;
                                                return false;
                                            },
                                            forced: true,
                                            content() {
                                                'step 0';
                                                player.judge(function (card) {
                                                    return get.color(card) == 'red' ? 2 : 0;
                                                });
                                                'step 1';
                                                if (result.judge > 0) {
                                                    trigger.getParent().excluded.add(player);
                                                }
                                            },
                                            sub: true,
                                        },
                                    },
                                },
                                zhaoji_daqi: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    init(player) {
                                        if (!player.storage.zhaoji_daqi) player.storage.zhaoji_daqi = 0;
                                    },
                                    marktext: '期',
                                    intro: {
                                        content: '当前有#个“期”标记',
                                    },
                                    trigger: {
                                        player: 'phaseBegin',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return player.storage.zhaoji_daqi != Infinity && player.storage.zhaoji_daqi >= 10;
                                    },
                                    content() {
                                        game.log(player, '失去了', player.storage.zhaoji_daqi, '个“期”标记');
                                        player.storage.zhaoji_daqi = 0;
                                        player.syncStorage('zhaoji_daqi');
                                        player.unmarkSkill('zhaoji_daqi');
                                        var hp = player.maxHp - player.hp;
                                        var card = player.maxHp - player.countCards('h');
                                        if (hp > 0) player.recover(hp);
                                        if (card > 0) player.draw(card);
                                        player.storage.zhaoji_huoluan = true;
                                    },
                                    group: ['zhaoji_daqi_damage', 'zhaoji_daqi_card'],
                                    subSkill: {
                                        damage: {
                                            trigger: {
                                                player: 'damageAfter',
                                                source: 'damageSource',
                                            },
                                            audio: 'zhaoji_daqi',
                                            forced: true,
                                            content() {
                                                player.storage.zhaoji_daqi += trigger.num;
                                                player.markSkill('zhaoji_daqi');
                                                game.log(player, '获得了', trigger.num, '个“期”标记');
                                                player.syncStorage('zhaoji_daqi');
                                            },
                                            sub: true,
                                        },
                                        card: {
                                            audio: 'zhaoji_daqi',
                                            trigger: {
                                                player: ['useCard', 'respond'],
                                            },
                                            forced: true,
                                            content() {
                                                player.storage.zhaoji_daqi++;
                                                player.markSkill('zhaoji_daqi');
                                                game.log(player, '获得了1个“期”标记');
                                                player.syncStorage('zhaoji_daqi');
                                            },
                                            sub: true,
                                        },
                                    },
                                },
                                zhaoji_xianji: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    init(player) {
                                        player.storage.nzry_dinghuo = false;
                                    },
                                    intro: {
                                        content: 'limited',
                                    },
                                    unique: true,
                                    mark: true,
                                    skillAnimation: true,
                                    animationColor: 'thunder',
                                    enable: 'phaseUse',
                                    filter(event, player) {
                                        return !player.storage.zhaoji_xianji && player.storage.zhaoji_daqi > 0;
                                    },
                                    check(event, player) {
                                        var hp = player.maxHp - player.hp;
                                        var card = 3 - player.countCards('he');
                                        if (hp + card > 0) return true;
                                        return false;
                                    },
                                    content() {
                                        'step 0';
                                        player.awakenSkill('zhaoji_xianji');
                                        player.storage.zhaoji_xianji = true;
                                        'step 1';
                                        var hs = player.getCards('he');
                                        if (hs.length) player.discard(hs);
                                        game.log(player, '失去了', player.storage.zhaoji_daqi, '个“期”标记');
                                        player.storage.zhaoji_daqi = 0;
                                        player.syncStorage('zhaoji_daqi');
                                        player.unmarkSkill('zhaoji_daqi');
                                        player.loseMaxHp();
                                        'step 2';
                                        var hp = player.maxHp - player.hp;
                                        var card = player.maxHp - player.countCards('h');
                                        if (hp > 0) player.recover(hp);
                                        if (card > 0) player.draw(card);
                                        player.storage.zhaoji_huoluan = true;
                                    },
                                    ai: {
                                        order: 1,
                                        result: {
                                            player(player, target) {
                                                var hp = player.maxHp - player.hp;
                                                var card = player.maxHp - player.countCards('h');
                                                return 0 + hp + card;
                                            },
                                        },
                                    },
                                },
                                zhaoji_huoluan: {
                                    audio: 'ext:活动萌扩/audio:true',
                                    trigger: {
                                        player: ['zhaoji_daqiAfter', 'zhaoji_xianjiAfter'],
                                    },
                                    forced: true,
                                    content() {
                                        'step 0';
                                        event.targets = game.filterPlayer();
                                        event.targets.remove(player);
                                        event.targets.sort(lib.sort.seat);
                                        player.line(event.targets);
                                        event.targets2 = event.targets.slice(0);
                                        'step 1';
                                        if (event.targets2.length) {
                                            event.targets2.shift().damage('nocard');
                                            event.redo();
                                        }
                                    },
                                },
                            },
                            translate: {
                                daqin: '秦',
                                daqin2: '秦朝',
                                zhu: '敌',
                                fan: '友',
                                zhong: '敌',
                                zhu2: ' ',
                                fan2: ' ',
                                zhong2: ' ',
                                hezongkangqin_player: '抗秦主角',
                                daqin_alpha0: '占位符0',
                                daqin_alpha1: '占位符1',
                                daqin_alpha2: '占位符2',
                                daqin_alpha3: '占位符3',
                                daqin_alpha4: '占位符4',
                                daqin_random1: '刘备/夏侯惇',
                                daqin_random2: '张角/孙权',
                                bol_unknown_male6: '步兵',
                                bol_unknown_male1: '羽林内军',
                                bol_unknown_male2: '常山府军',
                                bol_unknown_male3: '江夏弓骑兵',
                                bol_unknown_male4: '太行山豪侠',
                                bol_unknown_male5: '武林山隐伏',
                                bol_unknown_female6: '佣兵',
                                bol_unknown_female1: '黑绸巫女',
                                bol_unknown_female2: '美人计',
                                bol_unknown_female3: '婆娑匠奴',
                                bol_unknown_female4: '武库清点',
                                bol_unknown_female5: '血婆娑巧手',
                                daqin_yingzheng: '嬴政',
                                daqin_shangyang: '商鞅',
                                daqin_nushou: '秦军弩手',
                                daqin_qibing: '秦军骑兵',
                                daqin_bubing: '秦军步兵',
                                daqin_baiqi: '白起',
                                daqin_miyue: '芈月',
                                daqin_lvbuwei: '吕不韦',
                                daqin_zhaoji: '赵姬',
                                daqin_zhaogao: '赵高',
                                daqin_zhangyi: '张仪',
                                zhangyi_lianheng: '连横',
                                zhangyi_lianheng_info: '锁定技，游戏开始时，你令随机一名非秦势力的角色获得“横”标记。拥有“横”标记的角色使用牌时，无法指定秦势力角色为目标。你的回合开始时，场上所有角色弃置“横”标记。若非秦势力角色大于等于2人，则你令随机一名非秦势力角色获得“横”标记。',
                                zhangyi_xichu: '戏楚',
                                zhangyi_xichu_info: '锁定技，当你成为【杀】的目标时，若其攻击范围内有其他角色，则该角色需要弃置一张点数为6的牌，否则此【杀】的目标转移给其攻击范围内你指定的另一名角色。',
                                zhangyi_xiongbian: '雄辩',
                                zhangyi_xiongbian_info: '锁定技，当你成为普通锦囊牌的目标或之一时，你进行判定，若点数为6，你令此牌无效。',
                                zhangyi_qiaoshe: '巧舌',
                                zhangyi_qiaoshe_info: '当一名角色进行判定时，你可以令其判定牌的点数加减3以内的任意值。',
                                yingzheng_yitong: '一统',
                                yingzheng_yitong_info: '锁定技，你使用【杀】、【过河拆桥】、【顺手牵羊】、【火攻】的目标固定为所有非秦势力角色。你使用【杀】和【顺手牵羊】无距离限制。',
                                yingzheng_shihuang: '始皇',
                                yingzheng_shihuang_info: '锁定技，其他角色的回合结束后，你有X%的几率获得一个额外的回合（X为当前轮数*6，且X最大为100）。',
                                yingzheng_zulong: '祖龙',
                                yingzheng_zulong_info: '锁定技，你的回合开始时，若牌堆里有【传国玉玺】或【真龙长剑】，且不在你的手牌区或装备区，你获得之；若没有则你摸2张牌。',
                                yingzheng_fenshu: '焚书',
                                yingzheng_fenshu_info: '锁定技，非秦势力角色于其回合内使用的第一张普通锦囊牌无效。',
                                zhenlongchangjian_skill: '真龙长剑',
                                zhenlongchangjian_skill_info: '你于一回合内使用的第一张非延时性锦囊无法被无懈可击抵消。',
                                chuanguoyuxi_skill: '传国玉玺',
                                chuanguoyuxi_skill_info: '出牌阶段开始时，你可以从南蛮入侵、万箭齐发、桃园结义、五谷丰登中选择一张使用。',
                                qinnu_skill: '秦弩',
                                qinnu_skill_info: '当你使用【杀】指定一个目标后，你令其防具无效，你的出牌阶段内，可使用的【杀】数量+1；当你失去装备区里的【秦弩】，你令此牌销毁。',
                                shangyang_bianfa: '变法',
                                shangyang_bianfa_info: '出牌阶段限一次，你可以将任意一张普通锦囊牌当【商鞅变法】使用。',
                                shangyang_limu: '立木',
                                shangyang_limu_info: '锁定技，你使用的普通锦囊牌无法被【无懈可击】抵消。',
                                shangyang_kencao: '垦草',
                                shangyang_kencao_info: '锁定技，你存活时，秦势力角色每造成1点伤害，可获得一个“功”标记。若秦势力角色拥有大于等于3个“功”标记，则弃置所有“功”标记，增加1点体力上限，并回复1点体力。',
                                shangyangbianfa_dying: '商鞅变法',
                                shangyangbianfa_dying_info: '造成随机1~2点伤害，若该角色进入濒死状态，则进行判定，若判定结果为黑色，则该角色本次濒死状态无法向其他角色求桃。',
                                nushou_jinnu: '劲弩',
                                nushou_jinnu_info: '锁定技，你的回合开始时，若你的装备区里没有【秦弩】，你使用一张【秦弩】。',
                                qibing_changjian: '长剑',
                                qibing_changjian_info: '锁定技，你的攻击范围+1，你使用【杀】指定目标后，可额外选择一名目标，或令此杀伤害+1。',
                                qibing_liangju: '良驹',
                                qibing_liangju_info: '锁定技，你使用【杀】指定目标后，令目标进行判定，若为黑桃则此杀不可被闪避；当你成为【杀】的目标后，你进行判定，若为红桃则此杀对你无效。',
                                bubing_fangzhen: '方阵',
                                bubing_fangzhen_info: '锁定技，当你成为非秦势力角色使用普通锦囊或【杀】的目标后，若其在你的攻击范围内，你进行判定，若为黑色，则视为你对其使用一张【杀】。',
                                bubing_changbing: '长兵',
                                bubing_changbing_info: '锁定技，你的攻击范围+2。',
                                daqin_tongpao: '同袍',
                                daqin_tongpao_info: '锁定技，若你没有装备防具，其他秦势力角色使用防具牌时，你也视为使用一张同种防具牌。你通过“同袍”使用的防具牌离开你的装备区时会被销毁。',
                                baiqi_wuan: '武安',
                                baiqi_wuan_info: '锁定技，你存活时，所有秦势力角色每回合可使用【杀】的上限+1。',
                                baiqi_shashen: '杀神',
                                baiqi_shashen_info: '你可以将手牌中的任意一张牌当【杀】使用或打出。每回合你使用的第一张【杀】造成伤害后，摸一张牌。',
                                baiqi_fachu: '伐楚',
                                baiqi_fachu_info: '锁定技，当你对非秦势力角色造成伤害而导致其进入濒死状态后，你随机废除其一个装备区。',
                                baiqi_changsheng: '常胜',
                                baiqi_changsheng_info: '锁定技，你使用【杀】无距离。',
                                miyue_zhangzheng: '掌政',
                                miyue_zhangzheng_info: '锁定技，你的回合开始时，所有非秦势力角色依次选择：1.弃置一张手牌；2.失去1点体力。',
                                miyue_taihou: '太后',
                                miyue_taihou_info: '锁定技，男性角色对你使用【杀】或普通锦囊牌时，需要额外弃置一张同种类型的牌，否则此牌无效。',
                                miyue_youmie: '诱灭',
                                miyue_youmie_info: '出牌阶段限一次，你可以将一张牌交给一名角色，若如此做，直到你的下个回合开始，该角色于其回合外无法使用或打出牌。',
                                miyue_yintui: '隐退',
                                miyue_yintui_info: '锁定技，当你失去最后一张手牌时，你翻面。你的武将牌背面朝上时，若受到伤害，令此伤害-1，然后摸一张牌。',
                                lvbuwei_jugu: '巨贾',
                                lvbuwei_jugu_info: '锁定技，你的手牌上限+X；游戏开始时，你多摸X张牌（X为你的体力上限）。',
                                lvbuwei_qihuo: '奇货',
                                lvbuwei_qihuo_info: '出牌阶段限一次，你可以弃置一种类型的牌，并摸等同于你弃置牌数量的牌。',
                                lvbuwei_chunqiu: '春秋',
                                lvbuwei_chunqiu_info: '锁定技，每个回合你使用或打出第一张牌时，摸一张牌。',
                                lvbuwei_baixiang: '拜相',
                                lvbuwei_baixiang_info: '觉醒技，你的回合开始时，若你的手牌数大于等于你当前体力的三倍，则你将体力恢复至体力上限，并获得“仲父”技能。',
                                lvbuwei_zhongfu: '仲父',
                                lvbuwei_zhongfu_info: '锁定技，你的回合开始时，你随机获得【奸雄】、【仁德】、【制衡】中的一个直到你的下个回合开始。',
                                zhaoji_shanwu: '善舞',
                                zhaoji_shanwu_info: '锁定技，你使用【杀】指定目标后，你进行判定，若为黑色则敌方不能打出【闪】；当你成为【杀】的目标后，你进行判定，若为红色此杀无效。',
                                zhaoji_daqi: '大期',
                                zhaoji_daqi_info: '锁定技，你每使用或打出一张手牌、造成1点伤害、受到1点伤害，均会得到一个“期”标记。你的回合开始时，若你拥有的“期”标记大于等于10，则弃置所有“期”，体力回复至体力上限，并将手牌补至体力上限。',
                                zhaoji_xianji: '献姬',
                                zhaoji_xianji_info: '限定技，出牌阶段，你可以弃置所有手牌、装备牌和“期”标记，失去1点体力上限，然后立即发动大期的回复体力和补牌效果。',
                                zhaoji_huoluan: '祸乱',
                                zhaoji_huoluan_info: '锁定技，你每次发动大期的回复体力和补牌效果后，你对所有其他角色造成1点伤害。',
                                zhaogao_zhilu: '指鹿',
                                zhaogao_zhilu2: '指鹿',
                                zhaogao_zhilu_info: '你可以将红色手牌当【闪】使用或打出；将黑色手牌当【杀】使用或打出。',
                                zhaogao_zhilu2_info: '你可以将红色手牌当【闪】使用或打出；将黑色手牌当【杀】使用或打出。',
                                zhaogao_gaizhao: '改诏',
                                zhaogao_gaizhao_info: '当你成为【杀】或普通锦囊牌的目标后（借刀杀人除外），若场上有其他秦势力角色存活，你可以将此牌的目标改为其他不是该牌目标的秦势力角色。',
                                zhaogao_haizhong: '害忠',
                                zhaogao_haizhong_info: '锁定技，非秦势力角色回复体力时，其需要选择：1.弃置一张红色牌，2.受到你造成的X点伤害（X为该角色拥有的“害”标记，且至少为1）。然后该角色获得一个“害”标记。',
                                zhaogao_aili: '爰历',
                                zhaogao_aili_info: '锁定技，你的出牌阶段开始时，你额外获得2张普通锦囊。',
                                shangyangbianfa: '商鞅变法',
                                shangyangbianfa_info: '出牌阶段，对一名其他角色使用。对其造成随机1~2点伤害，若该角色进入濒死状态，则进行判定，若判定结果为黑色，则该角色本次濒死状态无法向其他角色求桃。',
                                zhenlongchangjian: '真龙长剑',
                                zhenlongchangjian_info: '你于一回合内使用的第一张非延时性锦囊无法被无懈可击抵消。',
                                chuanguoyuxi: '传国玉玺',
                                chuanguoyuxi_info: '出牌阶段开始时，你可以从南蛮入侵、万箭齐发、桃园结义、五谷丰登中选择一张使用。',
                                qinnu: '秦弩',
                                qinnu_info: '当你使用【杀】指定一个目标后，你令其防具无效，你的出牌阶段内，可使用的【杀】数量+1；当你失去装备区里的【秦弩】，你令此牌销毁。',
                            },
                            element: {
                                player: {
                                    logAi() { },
                                    getLevel() {
                                        const player = this;
                                        if (player == game.me) return parseInt(get.hzkq_config.characterLevel);
                                        if (player._isKangqinPlayer) return [3, 3, 3, 4, 4, 5].randomGet();
                                        if (_status.bol_hezongkangqin_name) {
                                            var name = _status.bol_hezongkangqin_name;
                                            if (player.group != 'daqin') {
                                                if (name == '匹配模式' || name == '变法者') return 3;
                                                else if (['帝国先驱', '中流砥柱', '乱！', '璀璨星河'].includes(name)) return 5;
                                                return 4;
                                            } else if (get.translation(player).indexOf('秦军') == 0) {
                                                if (name == '匹配模式') return 3;
                                                return 1;
                                            } else {
                                                if (name == '匹配模式') return 4;
                                                else if (['帝国先驱', '中流砥柱', '乱！', '璀璨星河'].includes(name)) return ['daqin_baiqi', 'daqin_yingzheng', 'daqin_zhaoji'].includes(player.name) ? 4 : 3;
                                                return 1;
                                            }
                                        }
                                        return 1;
                                    },
                                    setLevel() {
                                        const player = this,
                                            level = player.getLevel();
                                        player._kangqinLevel = level;
                                        if (level > 2) {
                                            var num = level > 4 ? 2 : 1;
                                            player.maxHp += num;
                                            player.hp += num;
                                            player.update();
                                        }
                                        if (level == 5 && player._isKangqinPlayer) player.addSkill('oldniepan');
                                        player.node.framebg.dataset.decoration = 'none';
                                        if (level == 3) player.node.framebg.dataset.decoration = 'bronze';
                                        if (level == 4) player.node.framebg.dataset.decoration = 'silver';
                                        if (level == 5) player.node.framebg.dataset.decoration = 'gold';
                                        player.node.framebg.dataset.auto = player.node.framebg.dataset.decoration;
                                    },
                                    dieAfter2(source) {
                                        if (source) {
                                            if (this.group == 'daqin') source.draw(3);
                                            else {
                                                var list = game.filterPlayer(function (current) {
                                                    return current.group != 'daqin';
                                                });
                                                if (list.length) game.asyncDraw(list);
                                            }
                                        }
                                    },
                                },
                            },
                        },
                    };
                    Object.assign(get, changeFunction.get);
                    Object.assign(game, changeFunction.game);
                    Object.assign(lib.translate, changeFunction.lib.translate);
                    Object.assign(lib.character, changeFunction.lib.character);
                    Object.assign(lib.characterIntro, changeFunction.lib.characterIntro);
                    Object.assign(lib.card, changeFunction.lib.card);
                    for (const i in changeFunction.lib.card) game.finishCard(i);
                    Object.assign(lib.skill, changeFunction.lib.skill);
                    for (const i in changeFunction.lib.skill) game.finishSkill(i);
                    Object.assign(player, changeFunction.lib.element.player);
                    Object.assign(lib.element.player, changeFunction.lib.element.player);
                    //选择剧情
                    const result = await player
                        .chooseButton(
                            [
                                '合纵抗秦：请选择你要游玩的剧情',
                                [
                                    [
                                        {
                                            name: '变法者',
                                            intro: '从“秦国”到“秦朝”，一切都开始于他...',
                                            players: [
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'daqin_shangyang', identity: 'zhu', isMe: false },
                                                { name: 're_liubei', identity: 'fan', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '合纵连横',
                                            intro: '当今天下，合纵抗秦。欲破合纵，今当连横！',
                                            players: [
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'daqin_zhangyi', identity: 'zhu', isMe: false },
                                                { name: 'dianwei', identity: 'fan', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '始太后',
                                            intro: '“自此时此刻起，我不再为后，为太后！”',
                                            players: [
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'daqin_miyue', identity: 'zhu', isMe: false },
                                                { name: 'daqin_bubing', identity: 'zhong', isMe: false },
                                                { name: 're_caocao', identity: 'fan', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '血战长平',
                                            intro: '面对未尝败绩的他，你能取得胜利吗？',
                                            players: [
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'daqin_qibing', identity: 'zhong', isMe: false },
                                                { name: 'daqin_baiqi', identity: 'zhu', isMe: false },
                                                { name: 're_zhangliao', identity: 'fan', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '吕氏春秋',
                                            intro: '贩珠卖玉非我所愿，立君建国方可泽被后世',
                                            players: [
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'daqin_qibing', identity: 'zhong', isMe: false },
                                                { name: 'daqin_lvbuwei', identity: 'zhu', isMe: false },
                                                { name: 're_huanggai', identity: 'fan', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '祸乱宫闱',
                                            intro: '谅这天下，也没有一个男人能拒绝我，哼哼哼……',
                                            players: [
                                                { name: 're_xiahoudun', identity: 'fan', isMe: false },
                                                { name: 'daqin_bubing', identity: 'zhong', isMe: false },
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 're_caocao', identity: 'fan', isMe: false },
                                                { name: 'daqin_zhaoji', identity: 'zhu', isMe: false },
                                                { name: 'daqin_nushou', identity: 'zhong', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '横扫六合',
                                            intro: '横扫六合，并吞八荒。举山河内外，皆匍匐脚下。',
                                            players: [
                                                { name: 're_guojia', identity: 'fan', isMe: false },
                                                { name: 're_xiahouyuan', identity: 'fan', isMe: false },
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'daqin_yingzheng', identity: 'zhu', isMe: false },
                                                { name: 'daqin_qibing', identity: 'zhong', isMe: false },
                                                { name: 'daqin_bubing', identity: 'zhong', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '沙丘谋变',
                                            intro: '秦皇已崩，从今天起，我姓赵的说了算。',
                                            players: [
                                                { name: 're_caocao', identity: 'fan', isMe: false },
                                                { name: 'daqin_zhaogao', identity: 'zhu', isMe: false },
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 're_liubei', identity: 'fan', isMe: false },
                                                { name: 'daqin_qibing', identity: 'zhong', isMe: false },
                                                { name: 'daqin_nushou', identity: 'zhong', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '帝国先驱',
                                            intro: '大秦帝国的革新者和战略家站在了一起',
                                            players: [
                                                { name: 'daqin_zhangyi', identity: 'zhu', isMe: false },
                                                { name: 'daqin_shangyang', identity: 'zhong', isMe: false },
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'daqin_random1', identity: 'fan', isMe: false },
                                                { name: 'daqin_random2', identity: 'fan', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '中流砥柱',
                                            intro: '内外夹击的话强烈攻势，你能否坚持多久？',
                                            players: [
                                                { name: 'dianwei', identity: 'fan', isMe: false },
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 're_liubei', identity: 'fan', isMe: false },
                                                { name: 'daqin_miyue', identity: 'zhong', isMe: false },
                                                { name: 'daqin_baiqi', identity: 'zhu', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '乱！',
                                            intro: '你要知道，有些人就是为乱世而生的。',
                                            players: [
                                                { name: 're_liubei', identity: 'fan', isMe: false },
                                                { name: 'daqin_lvbuwei', identity: 'zhong', isMe: false },
                                                { name: 'daqin_zhaoji', identity: 'zhu', isMe: false },
                                                { name: 'daqin_zhaogao', identity: 'zhong', isMe: false },
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'dianwei', identity: 'fan', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '璀璨星河',
                                            intro: '经受住考验的人，就是留名史册的人，就是英雄。',
                                            players: [
                                                { name: 'daqin_yingzheng', identity: 'zhu', isMe: false },
                                                { name: 'daqin_baiqi', identity: 'zhong', isMe: false },
                                                { name: 'daqin_random1', identity: 'fan', isMe: false },
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'daqin_random2', identity: 'fan', isMe: false },
                                                { name: 'daqin_zhangyi', identity: 'zhong', isMe: false },
                                                { name: 'daqin_shangyang', identity: 'zhong', isMe: false },
                                            ],
                                        },
                                        {
                                            name: '匹配模式',
                                            players: [
                                                { name: 'daqin_alpha1', identity: 'zhong', isMe: false },
                                                { name: 'daqin_alpha0', identity: 'zhong', isMe: false },
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'hezongkangqin_player', identity: 'fan', isMe: true },
                                                { name: 'daqin_alpha4', identity: 'zhong', isMe: false },
                                                { name: 'daqin_alpha3', identity: 'zhong', isMe: false },
                                                { name: 'daqin_alpha2', identity: 'zhong', isMe: false },
                                            ],
                                        },
                                    ].map(i => [i, i.intro ? '【' + i.name + '】' + i.intro : i.name]),
                                    'textbutton',
                                ],
                            ],
                            true
                        )
                        .set('onfree', true)
                        .forResult();
                    if (!result?.bool || !result.links?.length) game.reload();
                    const choice = result.links[0];
                    _status.bol_hezongkangqin_name = choice.name;
                    //加载角色
                    let players = choice.players,
                        item = players.filter(i => i.isMe).randomGet();
                    while (players[0] != item) players.push(players.shift());
                    ui.arena.setNumber(players.length);
                    for (const map of players) {
                        if (map == item) player.init(map.name);
                        const fellow = map == item ? player : game.addFellow(players.indexOf(map), map.name);
                        fellow.identity = map.identity;
                        if (fellow.identity == 'zhu') _status.firstAct2 = fellow;
                        fellow.setIdentity();
                        fellow.identityShown = true;
                        fellow.node.identity.classList.remove('guessing');
                        Object.assign(fellow, changeFunction.lib.element.player);
                    }
                    game.showIdentity(true);
                    const map = game.versusMap.randomGet();
                    const kangqinList = game.filterPlayer(current => {
                        if (current.name === 'hezongkangqin_player') current._isKangqinPlayer = true;
                        if (current.name.indexOf('daqin_alpha') == 0) {
                            var index = parseInt(current.name.slice('daqin_alpha'.length));
                            if (index == 1) _status.firstAct2 = current;
                            var name = map[index];
                            if (name == 'sanguo') name = _status.characterlist.randomRemove(1)[0];
                            else if (name == 'qinchao') name = ['daqin_qibing', 'daqin_bubing', 'daqin_nushou'].randomGet();
                            else {
                                current.identity = 'zhu';
                                current.setIdentity('zhu');
                                game.zhu = current;
                            }
                            current.uninit();
                            current.init(name);
                        } else if (current.name.indexOf('daqin_random') == 0) {
                            var name = (current.name.indexOf('1') != -1 ? ['re_liubei', 're_xiahoudun'] : ['re_zhangjiao', 're_sunquan']).randomGet();
                            current.uninit();
                            current.init(name);
                        } else if (current._isKangqinPlayer) {
                            if (current == game.me) {
                                current.uninit();
                                current.init(get.hzkq_config.character || 'bol_unknown_male6');
                                current.changeGroup(get.hzkq_config.group || 'wei', false);
                                const name = lib.config.connect_nickname;
                                const span = document.createElement('span'),
                                    style = span.style;
                                style.writingMode = style.webkitWritingMode = 'horizontal-tb';
                                span.textContent = name;
                                current._tempTranslate = name;
                                current.node.name.innerHTML = lib.config.extension_活动萌扩_kangqin_lineName ? name : span.outerHTML;
                            } else {
                                current.uninit();
                                current.init('bol_unknown_' + ['male', 'female'].randomGet() + parseFloat(get.rand(1, 6)));
                                current.changeGroup(lib.group.filter(i => i != 'daqin' && i != 'shen').randomGet(), false);
                                const name = get.hzkq_config.playername.randomRemove(1)[0];
                                const span = document.createElement('span'),
                                    style = span.style;
                                style.writingMode = style.webkitWritingMode = 'horizontal-tb';
                                span.textContent = name;
                                current._tempTranslate = name;
                                current.node.name.innerHTML = get.hzkq_config.lineName ? name : span.outerHTML;
                            }
                        }
                        current.setLevel();
                        return current._isKangqinPlayer;
                    });
                    //游戏事件
                    let name;
                    switch (choice.name) {
                        case '变法者': {
                            name = '变法图强';
                            _status.firstAct2 = game.me;
                            break;
                        }
                        case '合纵连横': {
                            name = '合纵连横';
                            _status.firstAct2 = game.me.previous;
                            break;
                        }
                        case '始太后': {
                            name = '始称太后';
                            _status.firstAct2 = game.me.previous;
                            break;
                        }
                        case '血战长平': {
                            name = '长平之战';
                            _status.firstAct2 = game.me.previous;
                            break;
                        }
                        case '吕氏春秋': {
                            name = '吕氏春秋';
                            _status.firstAct2 = game.me;
                            break;
                        }
                        case '祸乱宫闱': {
                            name = '赵姬之乱';
                            _status.firstAct2 = game.me.previous.previous;
                            break;
                        }
                        case '横扫六合': {
                            name = '横扫六合';
                            _status.firstAct2 = game.me.previous.previous;
                            break;
                        }
                        case '沙丘谋变': {
                            name = '沙丘之变';
                            _status.firstAct2 = game.me.previous.previous;
                            break;
                        }
                        case '帝国先驱': {
                            name = '合纵连横';
                            break;
                        }
                        case '中流砥柱': {
                            name = '长平之战';
                            _status.firstAct2 = game.me.previous;
                            break;
                        }
                        case '乱！': {
                            name = '赵姬之乱';
                            _status.firstAct2 = game.me.next.next;
                            break;
                        }
                        case '璀璨星河': {
                            name = '横扫六合';
                            break;
                        }
                        default: {
                            name = ['变法图强', '合纵连横', '长平之战', '横扫六合', '吕氏春秋', '沙丘之变', '赵姬之乱', '始称太后'].randomGet();
                            break;
                        }
                    }
                    game.setEvent(name);
                    //抗秦角色技能选择
                    let skills = [];
                    for (const name of _status.characterlist) {
                        if (lib.filter.characterDisabled2(name) || lib.filter.characterDisabled(name)) continue;
                        const skillsx = get.character(name).skills.slice();
                        const list = skillsx.slice(0);
                        for (let j = 0; j < skillsx.length; j++) {
                            const info = get.info(skillsx[j]);
                            if (!info) {
                                skillsx.splice(j, 1);
                                list.splice(j--, 1);
                                continue;
                            }
                            if (info.derivation) list.push(...info.derivation);
                        }
                        for (let j = 0; j < list.length; j++) {
                            if (skills.includes(list[j]) || !lib.skill[list[j]]) continue;
                            if (!Object.keys(list[j]).some(i => !i.startsWith('audio') && i !== '_priority' && i !== 'sub')) continue;
                            let info = lib.skill[list[j]];
                            if (!info || info.charlotte || info.zhuSkill || info.nopop || info.hiddenSkill || info.ai?.combo || info.ai?.neg) continue;
                            skills.push(list[j]);
                            lib.card['skillCard_' + list[j]] = {
                                fullimage: true,
                                image: 'character:' + name,
                            };
                            lib.translate['skillCard_' + list[j]] = lib.translate[list[j]];
                            lib.translate['skillCard_' + list[j] + '_info'] = lib.translate[list[j] + '_info'];
                        }
                    }
                    ui.arena.classList.add('choose-character');
                    if (kangqinList.length > 0) {
                        for (const current of kangqinList) {
                            const result2 = await current
                                .chooseButton(
                                    [
                                        '选择要获得的技能',
                                        [
                                            skills.randomGets(15).map(skill => {
                                                return ['', '', 'skillCard_' + skill];
                                            }),
                                            'vcard',
                                        ],
                                    ],
                                    true,
                                    [0, 2 + Math.floor((current._kangqinLevel - 1) / 2)]
                                )
                                .set('ai', button => {
                                    return get.skillRank(button.link[2], 'inout');
                                })
                                .forResult();
                            if (result2?.bool && result2.links?.length) {
                                current.addSkill(result2.links.map(info => info[2].slice('skillCard_'.length)));
                                game.broadcastAll(
                                    (player, names) => {
                                        player.tempname.addArray(
                                            names
                                                .map(list => {
                                                    return lib.card[list[2]].image.slice('character:'.length);
                                                })
                                                .unique()
                                        );
                                    },
                                    current,
                                    result2.links
                                );
                            }
                        }
                    }
                    setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                    //鏖战启动
                    if (_status._aozhan) {
                        player.$fullscreenpop('鏖战模式', get.groupnature(player.group, 'raw'));
                        await game.delay();
                    }
                });
            };
        },
    },
};
export default brawl;
/*
//模板
lib.brawl.XXX={
name:'XXX',
mode:'identity',
intro:[
],
init:function(){
},
showcase:function(init){
},
content:{
},
};
*/
