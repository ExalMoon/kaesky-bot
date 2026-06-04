const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const SUNUCU_ID = '1505901695601737900';
const SIKAYET_KANALI_ID = '1508120867467559103';
const ONERI_KANALI_ID = '1505901697392836744';
const TICKET_KATEGORI_ID = '1505901697392836742';
const YETKILI_ROL_ID = '1505933959605915709';
const SEVIYE_KANAL_ID = '1505901698571571357';
const TICKET_LOG_KANAL_ID = '1505901698571571359';

const cekilisler = new Map();
const kullaniciVerileri = new Map();

function xpHesapla(seviye) {
    return seviye * 100;
}

client.once('ready', async () => {
    console.log(`${client.user.tag} aktif!`);

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, SUNUCU_ID), { body: [
            new SlashCommandBuilder().setName('şikayet').setDescription('Yeni şikayet bildirimi oluştur'),
            new SlashCommandBuilder().setName('öneri').setDescription('Yeni öneri oluştur'),
            new SlashCommandBuilder().setName('destek').setDescription('Destek talebi paneli oluştur'),
            new SlashCommandBuilder().setName('hesap').setDescription('Hesap eşleme paneli oluştur'),
            new SlashCommandBuilder().setName('ip').setDescription('Minecraft sunucu IP bilgilerini göster'),
            new SlashCommandBuilder()
                .setName('çekiliş')
                .setDescription('Yeni çekiliş başlat')
                .addStringOption(opt => opt.setName('ödül').setDescription('Çekiliş ödülü').setRequired(true))
                .addIntegerOption(opt => opt.setName('süre').setDescription('Süre (dakika)').setRequired(true))
                .addIntegerOption(opt => opt.setName('kazanan').setDescription('Kazanan sayısı').setRequired(true)),
            new SlashCommandBuilder().setName('seviye').setDescription('Seviyeni gör'),
            new SlashCommandBuilder().setName('sıralama').setDescription('Sunucu XP sıralamasını gör'),
        ]});
        console.log('✅ Tüm slash komutları yüklendi!');
    } catch (error) {
        console.error('Komut yükleme hatası:', error);
    }
});

// Mesaj XP sistemi
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const userId = message.author.id;

    if (!kullaniciVerileri.has(userId)) {
        kullaniciVerileri.set(userId, { xp: 0, seviye: 1 });
    }

    const veri = kullaniciVerileri.get(userId);
    veri.xp += 5;

    const gerekliXP = xpHesapla(veri.seviye);

    if (veri.xp >= gerekliXP) {
        veri.xp -= gerekliXP;
        veri.seviye += 1;

        const seviyeKanali = message.guild.channels.cache.get(SEVIYE_KANAL_ID);
        if (seviyeKanali) {
            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🎉 Seviye Atladı!')
                .setDescription(`${message.author} yeni seviyesine ulaştı!`)
                .addFields(
                    { name: '🏆 Yeni Seviye', value: `**${veri.seviye}**`, inline: true },
                    { name: '⭐ Sonraki Seviye İçin', value: `${xpHesapla(veri.seviye)} XP`, inline: true }
                )
                .setThumbnail(message.author.displayAvatarURL())
                .setTimestamp();

            await seviyeKanali.send({ embeds: [embed] });
        }
    }

    kullaniciVerileri.set(userId, veri);
});

client.on('interactionCreate', async interaction => {

    if (interaction.isCommand()) {

        // IP Komutu
        if (interaction.commandName === 'ip') {
            const embed = new EmbedBuilder()
                .setColor(0x00FFAA)
                .setTitle('🌟 KaeSky Minecraft Sunucusu')
                .addFields(
                    { name: '📍 Sunucu IP', value: '`play.kaesky.com.tr`', inline: false },
                    { name: '🔧 Sürüm', value: '`1.21.x`', inline: true }
                )
                .setFooter({ text: 'KaeSky • Keyifli Oyunlar Dileriz!' })
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }

        // Destek Komutu
        if (interaction.commandName === 'destek') {
            const embed = new EmbedBuilder()
                .setColor(0x6B00FF)
                .setTitle('🎟 Destek Talebi Aç!')
                .setDescription('Butona tıklayarak yeni bir destek talebi oluşturabilirsiniz.')
                .setFooter({ text: 'KaeSky Destek Sistemi' });

            const button = new ButtonBuilder()
                .setCustomId('ticket_olustur')
                .setLabel('Destek Talebi Aç')
                .setEmoji('🎟')
                .setStyle(ButtonStyle.Primary);

            await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] });
        }

        // Şikayet Komutu
        if (interaction.commandName === 'şikayet') {
            const modal = new ModalBuilder()
                .setCustomId('sikayet_modal')
                .setTitle('📢 Yeni Şikayet Bildirimi');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('sikayet_nick')
                        .setLabel('Oyun İçi Kullanıcı Adınız')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('sikayet_edilen')
                        .setLabel('Şikayet Edilen Kullanıcı')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('sikayet_sebep')
                        .setLabel('Şikayet Sebebi')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );

            await interaction.showModal(modal);
        }

        // Öneri Komutu
        if (interaction.commandName === 'öneri') {
            const modal = new ModalBuilder()
                .setCustomId('oneri_modal')
                .setTitle('💡 Yeni Öneri');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('oneri_nick')
                        .setLabel('Oyun İçi Kullanıcı Adınız')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('oneri_icerik')
                        .setLabel('Öneriniz')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );

            await interaction.showModal(modal);
        }

        // Hesap Komutu
        if (interaction.commandName === 'hesap') {
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('🔗 Hesap Eşleme')
                .setDescription('⏳ Bu özellik yakında aktif olacak! Takipte kalın.')
                .setFooter({ text: 'KaeSky • Çok Yakında!' });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Çekiliş Komutu
        if (interaction.commandName === 'çekiliş') {
            if (!interaction.member.roles.cache.has(YETKILI_ROL_ID)) {
                return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkiniz yok!', ephemeral: true });
            }

            const odul = interaction.options.getString('ödül');
            const sure = interaction.options.getInteger('süre');
            const kazananSayisi = interaction.options.getInteger('kazanan');
            const bitis = Date.now() + sure * 60 * 1000;

            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🎉 ÇEKİLİŞ BAŞLADI!')
                .setDescription(`**Ödül:** ${odul}\n\nKatılmak için aşağıdaki butona tıkla!`)
                .addFields(
                    { name: '⏰ Bitiş', value: `<t:${Math.floor(bitis / 1000)}:R>`, inline: true },
                    { name: '🏆 Kazanan Sayısı', value: `${kazananSayisi}`, inline: true },
                    { name: '👥 Katılımcılar', value: '0 kişi', inline: true }
                )
                .setFooter({ text: 'KaeSky Çekiliş Sistemi' })
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId('cekilis_katil')
                .setLabel('Katıl!')
                .setEmoji('🎉')
                .setStyle(ButtonStyle.Success);

            await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] });
            const mesaj = await interaction.fetchReply();

            cekilisler.set(mesaj.id, {
                odul, kazananSayisi, bitis,
                katilimcilar: [],
                kanalId: interaction.channelId,
                mesajId: mesaj.id
            });

            setTimeout(async () => {
                const cekilis = cekilisler.get(mesaj.id);
                if (!cekilis) return;

                const kanal = interaction.guild.channels.cache.get(cekilis.kanalId);
                if (!kanal) return;

                const disabledButton = new ButtonBuilder()
                    .setCustomId('cekilis_bitti')
                    .setLabel('Çekiliş Bitti')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true);

                if (cekilis.katilimcilar.length === 0) {
                    const bitisEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('🎉 ÇEKİLİŞ BİTTİ!')
                        .setDescription(`**Ödül:** ${cekilis.odul}\n\n❌ Yeterli katılımcı olmadığı için kazanan seçilemedi.`)
                        .setFooter({ text: 'KaeSky Çekiliş Sistemi' })
                        .setTimestamp();
                    await kanal.messages.fetch(mesaj.id).then(m => m.edit({ embeds: [bitisEmbed], components: [new ActionRowBuilder().addComponents(disabledButton)] }));
                } else {
                    const karisik = [...cekilis.katilimcilar].sort(() => Math.random() - 0.5);
                    const kazananlar = karisik.slice(0, Math.min(cekilis.kazananSayisi, karisik.length));
                    const kazananMentions = kazananlar.map(id => `<@${id}>`).join(', ');

                    const bitisEmbed = new EmbedBuilder()
                        .setColor(0xFFD700)
                        .setTitle('🎉 ÇEKİLİŞ BİTTİ!')
                        .setDescription(`**Ödül:** ${cekilis.odul}\n\n🏆 **Kazanan(lar):** ${kazananMentions}`)
                        .addFields({ name: '👥 Toplam Katılımcı', value: `${cekilis.katilimcilar.length} kişi`, inline: true })
                        .setFooter({ text: 'KaeSky Çekiliş Sistemi' })
                        .setTimestamp();

                    await kanal.messages.fetch(mesaj.id).then(m => m.edit({ embeds: [bitisEmbed], components: [new ActionRowBuilder().addComponents(disabledButton)] }));
                    await kanal.send(`🎉 Tebrikler ${kazananMentions}! **${cekilis.odul}** ödülünü kazandınız!`);
                }

                cekilisler.delete(mesaj.id);
            }, sure * 60 * 1000);
        }

        // Seviye Komutu
        if (interaction.commandName === 'seviye') {
            const userId = interaction.user.id;
            const veri = kullaniciVerileri.get(userId) || { xp: 0, seviye: 1 };
            const gerekliXP = xpHesapla(veri.seviye);
            const yuzde = Math.floor((veri.xp / gerekliXP) * 10);
            const bar = '█'.repeat(yuzde) + '░'.repeat(10 - yuzde);

            const embed = new EmbedBuilder()
                .setColor(0x6B00FF)
                .setTitle(`📊 ${interaction.user.username} — Seviye Bilgisi`)
                .addFields(
                    { name: '🏆 Seviye', value: `**${veri.seviye}**`, inline: true },
                    { name: '⭐ XP', value: `${veri.xp} / ${gerekliXP}`, inline: true },
                    { name: '📈 İlerleme', value: `\`${bar}\` %${Math.floor((veri.xp / gerekliXP) * 100)}`, inline: false }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        // Sıralama Komutu
        if (interaction.commandName === 'sıralama') {
            const siralama = [...kullaniciVerileri.entries()]
                .sort((a, b) => (b[1].seviye * 10000 + b[1].xp) - (a[1].seviye * 10000 + a[1].xp))
                .slice(0, 10);

            if (siralama.length === 0) {
                return interaction.reply({ content: '❌ Henüz hiç veri yok!', ephemeral: true });
            }

            const satirlar = siralama.map(([id, veri], index) => {
                const madalya = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `**${index + 1}.**`;
                return `${madalya} <@${id}> — Seviye **${veri.seviye}** (${veri.xp} XP)`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🏆 XP Sıralaması')
                .setDescription(satirlar)
                .setFooter({ text: 'KaeSky Seviye Sistemi' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }

    // Çekilişe Katıl Butonu
    if (interaction.isButton() && interaction.customId === 'cekilis_katil') {
        const cekilis = cekilisler.get(interaction.message.id);
        if (!cekilis) {
            return interaction.reply({ content: '❌ Bu çekiliş artık aktif değil.', ephemeral: true });
        }
        if (cekilis.katilimcilar.includes(interaction.user.id)) {
            return interaction.reply({ content: '⚠️ Zaten bu çekilişe katıldınız!', ephemeral: true });
        }

        cekilis.katilimcilar.push(interaction.user.id);

        const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .spliceFields(2, 1, { name: '👥 Katılımcılar', value: `${cekilis.katilimcilar.length} kişi`, inline: true });

        await interaction.message.edit({ embeds: [embed] });
        await interaction.reply({ content: '✅ Çekilişe başarıyla katıldınız! İyi şanslar 🍀', ephemeral: true });
    }

    // Ticket Oluştur Butonu
    if (interaction.isButton() && interaction.customId === 'ticket_olustur') {
        const modal = new ModalBuilder()
            .setCustomId('ticket_modal')
            .setTitle('🎟 Yeni Destek Talebi');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('ticket_nick')
                    .setLabel('Oyun İçi Kullanıcı Adı')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('ticket_sorun')
                    .setLabel('Sorununuz nedir? (Kısaca anlatın)')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            )
        );

        await interaction.showModal(modal);
    }

    // Ticket Kapat Butonu
    if (interaction.isButton() && interaction.customId === 'ticket_kapat') {
        const kanal = interaction.channel;

        // Kanal mesajlarını topla (log için)
        const mesajlar = await kanal.messages.fetch({ limit: 100 });
        const logMetni = mesajlar
            .reverse()
            .map(m => `[${new Date(m.createdTimestamp).toLocaleString('tr-TR')}] ${m.author.tag}: ${m.content || '[Embed/Dosya]'}`)
            .join('\n');

        // Log kanalına gönder
        const logKanali = interaction.guild.channels.cache.get(TICKET_LOG_KANAL_ID);
        if (logKanali) {
            const logEmbed = new EmbedBuilder()
                .setColor(0xFF4444)
                .setTitle('🗂 Ticket Kapatıldı')
                .addFields(
                    { name: '📋 Kanal', value: kanal.name, inline: true },
                    { name: '🔒 Kapatan', value: `${interaction.user}`, inline: true },
                    { name: '📅 Tarih', value: new Date().toLocaleString('tr-TR'), inline: true }
                )
                .setFooter({ text: 'KaeSky Ticket Sistemi' })
                .setTimestamp();

            // Log metnini dosya olarak gönder
            const { AttachmentBuilder } = require('discord.js');
            const buffer = Buffer.from(logMetni, 'utf-8');
            const dosya = new AttachmentBuilder(buffer, { name: `ticket-${kanal.name}.txt` });

            await logKanali.send({ embeds: [logEmbed], files: [dosya] });
        }

        await interaction.reply({ content: '🔒 Ticket kapatılıyor...' });
        setTimeout(() => kanal.delete().catch(console.error), 3000);
    }

    // Ticket Modal Submit
    if (interaction.isModalSubmit() && interaction.customId === 'ticket_modal') {
        const nick = interaction.fields.getTextInputValue('ticket_nick');
        const sorun = interaction.fields.getTextInputValue('ticket_sorun');

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: TICKET_KATEGORI_ID,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });

            const embed = new EmbedBuilder()
                .setColor(0x6B00FF)
                .setTitle('🎟 Yeni Destek Talebi')
                .addFields(
                    { name: '👤 Kullanıcı', value: `${interaction.user}`, inline: true },
                    { name: '🎮 Oyun İçi Nick', value: nick, inline: true },
                    { name: '❓ Sorun', value: sorun }
                )
                .setTimestamp();

            const kapatBtn = new ButtonBuilder()
                .setCustomId('ticket_kapat')
                .setLabel('Ticketı Kapat')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger);

            await ticketChannel.send({
                embeds: [embed],
                content: `${interaction.user} destek talebiniz başarıyla açıldı!`,
                components: [new ActionRowBuilder().addComponents(kapatBtn)]
            });

            await interaction.reply({
                content: `✅ Destek talebiniz oluşturuldu! → ${ticketChannel}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Ticket oluşturulamadı. Kategori ID\'sini kontrol edin.', ephemeral: true });
        }
    }

    // Şikayet Modal Submit
    if (interaction.isModalSubmit() && interaction.customId === 'sikayet_modal') {
        const nick = interaction.fields.getTextInputValue('sikayet_nick');
        const edilen = interaction.fields.getTextInputValue('sikayet_edilen');
        const sebep = interaction.fields.getTextInputValue('sikayet_sebep');

        const kanal = interaction.guild.channels.cache.get(SIKAYET_KANALI_ID);
        if (!kanal) {
            return interaction.reply({ content: '❌ Şikayet kanalı bulunamadı.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('📢 Yeni Şikayet Bildirimi')
            .addFields(
                { name: '👤 Şikayetçi (Discord)', value: `${interaction.user}`, inline: true },
                { name: '🎮 Oyun İçi Nick', value: nick, inline: true },
                { name: '🚨 Şikayet Edilen', value: edilen, inline: false },
                { name: '📝 Şikayet Sebebi', value: sebep, inline: false }
            )
            .setFooter({ text: 'KaeSky Şikayet Sistemi' })
            .setTimestamp();

        await kanal.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Şikayetiniz iletildi, en kısa sürede incelenecek!', ephemeral: true });
    }

    // Öneri Modal Submit
    if (interaction.isModalSubmit() && interaction.customId === 'oneri_modal') {
        const nick = interaction.fields.getTextInputValue('oneri_nick');
        const icerik = interaction.fields.getTextInputValue('oneri_icerik');

        const kanal = interaction.guild.channels.cache.get(ONERI_KANALI_ID);
        if (!kanal) {
            return interaction.reply({ content: '❌ Öneri kanalı bulunamadı.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0x00BFFF)
            .setTitle('💡 Yeni Öneri')
            .addFields(
                { name: '👤 Kullanıcı (Discord)', value: `${interaction.user}`, inline: true },
                { name: '🎮 Oyun İçi Nick', value: nick, inline: true },
                { name: '💬 Öneri', value: icerik, inline: false }
            )
            .setFooter({ text: 'KaeSky Öneri Sistemi' })
            .setTimestamp();

        await kanal.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Öneriniz iletildi, teşekkürler!', ephemeral: true });
    }
});

client.login(TOKEN);
