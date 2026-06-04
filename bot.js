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

client.once('ready', async () => {
    console.log(`${client.user.tag} aktif!`);

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, SUNUCU_ID), { body: [
            new SlashCommandBuilder().setName('şikayet').setDescription('Yeni şikayet bildirimi oluştur'),
            new SlashCommandBuilder().setName('öneri').setDescription('Yeni öneri oluştur'),
            new SlashCommandBuilder().setName('destek').setDescription('Destek talebi paneli oluştur'),
            new SlashCommandBuilder().setName('hesap').setDescription('Hesap eşleme paneli oluştur'),
            new SlashCommandBuilder().setName('ip').setDescription('Minecraft sunucu IP bilgilerini göster')
        ]});
        console.log('✅ Tüm slash komutları yüklendi!');
    } catch (error) {
        console.error('Komut yükleme hatası:', error);
    }
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
    }

    // Ticket Butonu
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

            await ticketChannel.send({ 
                embeds: [embed], 
                content: `${interaction.user} destek talebiniz başarıyla açıldı!` 
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
