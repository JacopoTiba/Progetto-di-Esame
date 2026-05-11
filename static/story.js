–l–e–t– –c–u–r–r–e–n–t–S–t–o–r–y– –=– –n–u–l–l–;––
––
–f–u–n–c–t–i–o–n– –g–e–t–C–u–r–r–e–n–t–U–s–e–r–(–)– –{––
– – – – –c–o–n–s–t– –m–a–t–c–h– –=– –d–o–c–u–m–e–n–t–.–c–o–o–k–i–e––
– – – – – – – – –.–s–p–l–i–t–(–'–;– –'–)––
– – – – – – – – –.–f–i–n–d–(–(–r–o–w–)– –=–>– –r–o–w–.–s–t–a–r–t–s–W–i–t–h–(–'–u–t–e–n–t–e–=–'–)–)–;––
– – – – –i–f– –(–!–m–a–t–c–h–)– –r–e–t–u–r–n– –n–u–l–l–;––
– – – – –t–r–y– –{––
– – – – – – – – –r–e–t–u–r–n– –J–S–O–N–.–p–a–r–s–e–(–d–e–c–o–d–e–U–R–I–C–o–m–p–o–n–e–n–t–(–m–a–t–c–h–.–s–p–l–i–t–(–'–=–'–)–.–s–l–i–c–e–(–1–)–.–j–o–i–n–(–'–=–'–)–)–)–;––
– – – – –}– –c–a–t–c–h– –{––
– – – – – – – – –r–e–t–u–r–n– –n–u–l–l–;––
– – – – –}––
–}––
––
–f–u–n–c–t–i–o–n– –e–s–c–a–p–e–H–t–m–l–(–v–a–l–u–e–)– –{––
– – – – –r–e–t–u–r–n– –S–t–r–i–n–g–(–v–a–l–u–e– –|–|– –'–'–)––
– – – – – – – – –.–r–e–p–l–a–c–e–A–l–l–(–'–&–'–,– –'–&–a–m–p–;–'–)––
– – – – – – – – –.–r–e–p–l–a–c–e–A–l–l–(–'–<–'–,– –'–&–l–t–;–'–)––
– – – – – – – – –.–r–e–p–l–a–c–e–A–l–l–(–'–>–'–,– –'–&–g–t–;–'–)––
– – – – – – – – –.–r–e–p–l–a–c–e–A–l–l–(–'–"–'–,– –'–&–q–u–o–t–;–'–)––
– – – – – – – – –.–r–e–p–l–a–c–e–A–l–l–(–"–'–"–,– –'–&–#–3–9–;–'–)–;––
–}––
––
–f–u–n–c–t–i–o–n– –r–e–n–d–e–r–R–e–v–i–e–w–s–(–i–t–e–m–s–)– –{––
– – – – –c–o–n–s–t– –l–i–s–t– –=– –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–r–e–v–i–e–w–s–L–i–s–t–'–)–;––
– – – – –c–o–n–s–t– –c–o–u–n–t– –=– –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–c–o–m–m–e–n–t–C–o–u–n–t–'–)–;––
– – – – –i–f– –(–!–l–i–s–t– –|–|– –!–c–o–u–n–t–)– –r–e–t–u–r–n–;––
––
– – – – –c–o–u–n–t–.–t–e–x–t–C–o–n–t–e–n–t– –=– –i–t–e–m–s–.–l–e–n–g–t–h–;––
– – – – –l–i–s–t–.–i–n–n–e–r–H–T–M–L– –=– –'–'–;––
––
– – – – –i–f– –(–!–i–t–e–m–s–.–l–e–n–g–t–h–)– –{––
– – – – – – – – –l–i–s–t–.–i–n–n–e–r–H–T–M–L– –=– –'–<–p– –c–l–a–s–s–=–"–r–e–v–i–e–w–s–-–e–m–p–t–y–"–>–N–e–s–s–u–n–a– –r–e–c–e–n–s–i–o–n–e– –a–n–c–o–r–a–.– –S–c–r–i–v–i– –l–a– –p–r–i–m–a–!–<–/–p–>–'–;––
– – – – – – – – –r–e–t–u–r–n–;––
– – – – –}––
––
– – – – –i–t–e–m–s–.–f–o–r–E–a–c–h–(–(–r–)– –=–>– –{––
– – – – – – – – –c–o–n–s–t– –s–t–a–r–s– –=– –'–â–˜–…–'–.–r–e–p–e–a–t–(–M–a–t–h–.–m–a–x–(–1–,– –M–a–t–h–.–m–i–n–(–5–,– –N–u–m–b–e–r–(–r–.–v–o–t–o– –|–|– –0–)–)–)–)–;––
– – – – – – – – –c–o–n–s–t– –c–a–r–d– –=– –`––
– – – – – – – – – – – – –<–a–r–t–i–c–l–e– –c–l–a–s–s–=–"–r–e–v–i–e–w–-–i–t–e–m–"–>––
– – – – – – – – – – – – – – – – –<–d–i–v– –c–l–a–s–s–=–"–r–e–v–i–e–w–-–h–e–a–d–"–>––
– – – – – – – – – – – – – – – – – – – – –<–s–t–r–o–n–g–>–$–{–e–s–c–a–p–e–H–t–m–l–(–r–.–u–s–e–r–n–a–m–e– –|–|– –'–U–t–e–n–t–e–'–)–}–<–/–s–t–r–o–n–g–>––
– – – – – – – – – – – – – – – – – – – – –<–s–p–a–n– –c–l–a–s–s–=–"–r–e–v–i–e–w–-–s–t–a–r–s–"–>–$–{–s–t–a–r–s–}–<–/–s–p–a–n–>––
– – – – – – – – – – – – – – – – –<–/–d–i–v–>––
– – – – – – – – – – – – – – – – –<–p–>–$–{–e–s–c–a–p–e–H–t–m–l–(–r–.–t–e–s–t–o– –|–|– –'–'–)–}–<–/–p–>––
– – – – – – – – – – – – –<–/–a–r–t–i–c–l–e–>––
– – – – – – – – –`–;––
– – – – – – – – –l–i–s–t–.–i–n–s–e–r–t–A–d–j–a–c–e–n–t–H–T–M–L–(–'–b–e–f–o–r–e–e–n–d–'–,– –c–a–r–d–)–;––
– – – – –}–)–;––
–}––
––
–a–s–y–n–c– –f–u–n–c–t–i–o–n– –l–o–a–d–R–e–v–i–e–w–s–(–s–t–o–r–y–I–d–)– –{––
– – – – –t–r–y– –{––
– – – – – – – – –c–o–n–s–t– –r–e–s– –=– –a–w–a–i–t– –f–e–t–c–h–(–`–/–a–p–i–/–s–t–o–r–i–e–/–$–{–s–t–o–r–y–I–d–}–/–r–e–c–e–n–s–i–o–n–i–`–)–;––
– – – – – – – – –i–f– –(–!–r–e–s–.–o–k–)– –t–h–r–o–w– –n–e–w– –E–r–r–o–r–(–'–E–r–r–o–r–e– –r–e–c–e–n–s–i–o–n–i–'–)–;––
– – – – – – – – –c–o–n–s–t– –d–a–t–a– –=– –a–w–a–i–t– –r–e–s–.–j–s–o–n–(–)–;––
– – – – – – – – –r–e–n–d–e–r–R–e–v–i–e–w–s–(–d–a–t–a–.–r–e–c–e–n–s–i–o–n–i– –|–|– –[–]–)–;––
– – – – –}– –c–a–t–c–h– –(–e–r–r–)– –{––
– – – – – – – – –c–o–n–s–o–l–e–.–e–r–r–o–r–(–e–r–r–)–;––
– – – – – – – – –r–e–n–d–e–r–R–e–v–i–e–w–s–(–[–]–)–;––
– – – – –}––
–}––
––
–f–u–n–c–t–i–o–n– –b–i–n–d–R–e–v–i–e–w–F–o–r–m–(–s–t–o–r–y–I–d–)– –{––
– – – – –c–o–n–s–t– –f–o–r–m– –=– –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–r–e–v–i–e–w–F–o–r–m–'–)–;––
– – – – –i–f– –(–!–f–o–r–m–)– –r–e–t–u–r–n–;––
––
– – – – –f–o–r–m–.–a–d–d–E–v–e–n–t–L–i–s–t–e–n–e–r–(–'–s–u–b–m–i–t–'–,– –a–s–y–n–c– –(–e–)– –=–>– –{––
– – – – – – – – –e–.–p–r–e–v–e–n–t–D–e–f–a–u–l–t–(–)–;––
– – – – – – – – –c–o–n–s–t– –u–s–e–r– –=– –g–e–t–C–u–r–r–e–n–t–U–s–e–r–(–)–;––
– – – – – – – – –i–f– –(–!–u–s–e–r–?–.–e–m–a–i–l–)– –{––
– – – – – – – – – – – – –a–l–e–r–t–(–'–D–e–v–i– –e–s–s–e–r–e– –l–o–g–g–a–t–o– –p–e–r– –r–e–c–e–n–s–i–r–e–.–'–)–;––
– – – – – – – – – – – – –r–e–t–u–r–n–;––
– – – – – – – – –}––
––
– – – – – – – – –c–o–n–s–t– –v–o–t–o– –=– –N–u–m–b–e–r–(–d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–r–e–v–i–e–w–R–a–t–i–n–g–'–)–?–.–v–a–l–u–e– –|–|– –0–)–;––
– – – – – – – – –c–o–n–s–t– –t–e–s–t–o– –=– –(–d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–r–e–v–i–e–w–T–e–x–t–'–)–?–.–v–a–l–u–e– –|–|– –'–'–)–.–t–r–i–m–(–)–;––
––
– – – – – – – – –c–o–n–s–t– –r–e–s– –=– –a–w–a–i–t– –f–e–t–c–h–(–`–/–a–p–i–/–s–t–o–r–i–e–/–$–{–s–t–o–r–y–I–d–}–/–r–e–c–e–n–s–i–o–n–i–`–,– –{––
– – – – – – – – – – – – –m–e–t–h–o–d–:– –'–P–O–S–T–'–,––
– – – – – – – – – – – – –h–e–a–d–e–r–s–:– –{– –'–C–o–n–t–e–n–t–-–T–y–p–e–'–:– –'–a–p–p–l–i–c–a–t–i–o–n–/–j–s–o–n–'– –}–,––
– – – – – – – – – – – – –b–o–d–y–:– –J–S–O–N–.–s–t–r–i–n–g–i–f–y–(–{– –e–m–a–i–l–:– –u–s–e–r–.–e–m–a–i–l–,– –v–o–t–o–,– –t–e–s–t–o– –}–)–,––
– – – – – – – – –}–)–;––
––
– – – – – – – – –i–f– –(–!–r–e–s–.–o–k–)– –{––
– – – – – – – – – – – – –a–l–e–r–t–(–'–E–r–r–o–r–e– –n–e–l– –s–a–l–v–a–t–a–g–g–i–o– –d–e–l–l–a– –r–e–c–e–n–s–i–o–n–e–.–'–)–;––
– – – – – – – – – – – – –r–e–t–u–r–n–;––
– – – – – – – – –}––
––
– – – – – – – – –f–o–r–m–.–r–e–s–e–t–(–)–;––
– – – – – – – – –l–o–a–d–R–e–v–i–e–w–s–(–s–t–o–r–y–I–d–)–;––
– – – – –}–)–;––
–}––
––
–f–u–n–c–t–i–o–n– –b–i–n–d–L–i–k–e–(–s–t–o–r–y–I–d–)– –{––
– – – – –c–o–n–s–t– –b–t–n– –=– –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–b–t–n–L–i–k–e–'–)–;––
– – – – –c–o–n–s–t– –c–o–u–n–t– –=– –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–l–i–k–e–C–o–u–n–t–'–)–;––
– – – – –i–f– –(–!–b–t–n– –|–|– –!–c–o–u–n–t–)– –r–e–t–u–r–n–;––
––
– – – – –b–t–n–.–a–d–d–E–v–e–n–t–L–i–s–t–e–n–e–r–(–'–c–l–i–c–k–'–,– –a–s–y–n–c– –(–)– –=–>– –{––
– – – – – – – – –c–o–n–s–t– –u–s–e–r– –=– –g–e–t–C–u–r–r–e–n–t–U–s–e–r–(–)–;––
– – – – – – – – –i–f– –(–!–u–s–e–r–?–.–e–m–a–i–l–)– –{––
– – – – – – – – – – – – –a–l–e–r–t–(–'–D–e–v–i– –e–s–s–e–r–e– –l–o–g–g–a–t–o– –p–e–r– –m–e–t–t–e–r–e– –l–i–k–e–.–'–)–;––
– – – – – – – – – – – – –r–e–t–u–r–n–;––
– – – – – – – – –}––
––
– – – – – – – – –c–o–n–s–t– –r–e–s– –=– –a–w–a–i–t– –f–e–t–c–h–(–`–/–a–p–i–/–s–t–o–r–i–e–/–$–{–s–t–o–r–y–I–d–}–/–l–i–k–e–`–,– –{––
– – – – – – – – – – – – –m–e–t–h–o–d–:– –'–P–O–S–T–'–,––
– – – – – – – – – – – – –h–e–a–d–e–r–s–:– –{– –'–C–o–n–t–e–n–t–-–T–y–p–e–'–:– –'–a–p–p–l–i–c–a–t–i–o–n–/–j–s–o–n–'– –}–,––
– – – – – – – – – – – – –b–o–d–y–:– –J–S–O–N–.–s–t–r–i–n–g–i–f–y–(–{– –e–m–a–i–l–:– –u–s–e–r–.–e–m–a–i–l– –}–)–,––
– – – – – – – – –}–)–;––
––
– – – – – – – – –i–f– –(–!–r–e–s–.–o–k–)– –{––
– – – – – – – – – – – – –a–l–e–r–t–(–'–E–r–r–o–r–e– –n–e–l– –l–i–k–e–.–'–)–;––
– – – – – – – – – – – – –r–e–t–u–r–n–;––
– – – – – – – – –}––
––
– – – – – – – – –c–o–n–s–t– –d–a–t–a– –=– –a–w–a–i–t– –r–e–s–.–j–s–o–n–(–)–;––
– – – – – – – – –c–o–u–n–t–.–t–e–x–t–C–o–n–t–e–n–t– –=– –d–a–t–a–.–n–L–i–k–e–;––
– – – – – – – – –b–t–n–.–c–l–a–s–s–L–i–s–t–.–t–o–g–g–l–e–(–'–a–c–t–i–v–e–'–,– –!–!–d–a–t–a–.–l–i–k–e–d–)–;––
– – – – –}–)–;––
–}––
––
–f–u–n–c–t–i–o–n– –b–i–n–d–B–o–o–k–m–a–r–k–(–s–t–o–r–y–I–d–)– –{––
– – – – –c–o–n–s–t– –b–t–n– –=– –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–b–t–n–B–o–o–k–m–a–r–k–'–)–;––
– – – – –i–f– –(–!–b–t–n–)– –r–e–t–u–r–n–;––
––
– – – – –c–o–n–s–t– –s–e–t–B–o–o–k–m–a–r–k–U–i– –=– –(–i–s–F–a–v–o–r–i–t–e–)– –=–>– –{––
– – – – – – – – –b–t–n–.–c–l–a–s–s–L–i–s–t–.–t–o–g–g–l–e–(–'–a–c–t–i–v–e–'–,– –!–!–i–s–F–a–v–o–r–i–t–e–)–;––
– – – – – – – – –b–t–n–.–s–e–t–A–t–t–r–i–b–u–t–e–(–'–d–a–t–a–-–t–i–p–'–,– –i–s–F–a–v–o–r–i–t–e– –?– –'–S–a–l–v–a–t–o–'– –:– –'–S–a–l–v–a–'–)–;––
– – – – –}–;––
––
– – – – –c–o–n–s–t– –l–o–a–d–I–n–i–t–i–a–l–B–o–o–k–m–a–r–k–S–t–a–t–e– –=– –a–s–y–n–c– –(–)– –=–>– –{––
– – – – – – – – –c–o–n–s–t– –u–s–e–r– –=– –g–e–t–C–u–r–r–e–n–t–U–s–e–r–(–)–;––
– – – – – – – – –i–f– –(–!–u–s–e–r–?–.–e–m–a–i–l–)– –r–e–t–u–r–n–;––
––
– – – – – – – – –t–r–y– –{––
– – – – – – – – – – – – –c–o–n–s–t– –m–e–R–e–s– –=– –a–w–a–i–t– –f–e–t–c–h–(–`–/–a–p–i–/–u–t–e–n–t–i–/–e–m–a–i–l–/–$–{–e–n–c–o–d–e–U–R–I–C–o–m–p–o–n–e–n–t–(–u–s–e–r–.–e–m–a–i–l–)–}–`–)–;––
– – – – – – – – – – – – –i–f– –(–!–m–e–R–e–s–.–o–k–)– –r–e–t–u–r–n–;––
– – – – – – – – – – – – –c–o–n–s–t– –m–e– –=– –a–w–a–i–t– –m–e–R–e–s–.–j–s–o–n–(–)–;––
––
– – – – – – – – – – – – –c–o–n–s–t– –f–a–v–R–e–s– –=– –a–w–a–i–t– –f–e–t–c–h–(–`–/–a–p–i–/–u–t–e–n–t–i–/–$–{–m–e–.–i–d–}–/–p–r–e–f–e–r–i–t–i–`–)–;––
– – – – – – – – – – – – –i–f– –(–!–f–a–v–R–e–s–.–o–k–)– –r–e–t–u–r–n–;––
– – – – – – – – – – – – –c–o–n–s–t– –f–a–v–D–a–t–a– –=– –a–w–a–i–t– –f–a–v–R–e–s–.–j–s–o–n–(–)–;––
– – – – – – – – – – – – –c–o–n–s–t– –p–r–e–f–e–r–i–t–i– –=– –f–a–v–D–a–t–a–.–p–r–e–f–e–r–i–t–i– –|–|– –[–]–;––
– – – – – – – – – – – – –c–o–n–s–t– –i–s–F–a–v–o–r–i–t–e– –=– –p–r–e–f–e–r–i–t–i–.–s–o–m–e–(–(–s–)– –=–>– –s–.–i–d– –=–=–=– –s–t–o–r–y–I–d–)–;––
– – – – – – – – – – – – –s–e–t–B–o–o–k–m–a–r–k–U–i–(–i–s–F–a–v–o–r–i–t–e–)–;––
– – – – – – – – –}– –c–a–t–c–h– –(–e–r–r–)– –{––
– – – – – – – – – – – – –c–o–n–s–o–l–e–.–e–r–r–o–r–(–'–E–r–r–o–r–e– –c–a–r–i–c–a–m–e–n–t–o– –s–t–a–t–o– –p–r–e–f–e–r–i–t–o–:–'–,– –e–r–r–)–;––
– – – – – – – – –}––
– – – – –}–;––
––
– – – – –l–o–a–d–I–n–i–t–i–a–l–B–o–o–k–m–a–r–k–S–t–a–t–e–(–)–;––
––
– – – – –b–t–n–.–a–d–d–E–v–e–n–t–L–i–s–t–e–n–e–r–(–'–c–l–i–c–k–'–,– –a–s–y–n–c– –(–)– –=–>– –{––
– – – – – – – – –c–o–n–s–t– –u–s–e–r– –=– –g–e–t–C–u–r–r–e–n–t–U–s–e–r–(–)–;––
– – – – – – – – –i–f– –(–!–u–s–e–r–?–.–e–m–a–i–l–)– –{––
– – – – – – – – – – – – –a–l–e–r–t–(–'–D–e–v–i– –e–s–s–e–r–e– –l–o–g–g–a–t–o– –p–e–r– –s–a–l–v–a–r–e– –n–e–i– –p–r–e–f–e–r–i–t–i–.–'–)–;––
– – – – – – – – – – – – –r–e–t–u–r–n–;––
– – – – – – – – –}––
––
– – – – – – – – –c–o–n–s–t– –r–e–s– –=– –a–w–a–i–t– –f–e–t–c–h–(–`–/–a–p–i–/–s–t–o–r–i–e–/–$–{–s–t–o–r–y–I–d–}–/–p–r–e–f–e–r–i–t–i–`–,– –{––
– – – – – – – – – – – – –m–e–t–h–o–d–:– –'–P–O–S–T–'–,––
– – – – – – – – – – – – –h–e–a–d–e–r–s–:– –{– –'–C–o–n–t–e–n–t–-–T–y–p–e–'–:– –'–a–p–p–l–i–c–a–t–i–o–n–/–j–s–o–n–'– –}–,––
– – – – – – – – – – – – –b–o–d–y–:– –J–S–O–N–.–s–t–r–i–n–g–i–f–y–(–{– –e–m–a–i–l–:– –u–s–e–r–.–e–m–a–i–l– –}–)–,––
– – – – – – – – –}–)–;––
––
– – – – – – – – –i–f– –(–!–r–e–s–.–o–k–)– –{––
– – – – – – – – – – – – –a–l–e–r–t–(–'–E–r–r–o–r–e– –n–e–l– –s–a–l–v–a–t–a–g–g–i–o– –p–r–e–f–e–r–i–t–o–.–'–)–;––
– – – – – – – – – – – – –r–e–t–u–r–n–;––
– – – – – – – – –}––
––
– – – – – – – – –c–o–n–s–t– –d–a–t–a– –=– –a–w–a–i–t– –r–e–s–.–j–s–o–n–(–)–;––
– – – – – – – – –s–e–t–B–o–o–k–m–a–r–k–U–i–(–!–!–d–a–t–a–.–i–s–F–a–v–o–r–i–t–e–)–;––
– – – – – – – – –a–l–e–r–t–(–d–a–t–a–.–i–s–F–a–v–o–r–i–t–e– –?– –'–A–g–g–i–u–n–t–o– –a–i– –p–r–e–f–e–r–i–t–i–.–'– –:– –'–R–i–m–o–s–s–o– –d–a–i– –p–r–e–f–e–r–i–t–i–.–'–)–;––
– – – – –}–)–;––
–}––
––
–f–u–n–c–t–i–o–n– –b–i–n–d–C–o–m–m–e–n–t–S–c–r–o–l–l–(–)– –{––
– – – – –c–o–n–s–t– –b–t–n– –=– –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–b–t–n–C–o–m–m–e–n–t–'–)–;––
– – – – –c–o–n–s–t– –s–e–c–t–i–o–n– –=– –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–r–e–v–i–e–w–s–S–e–c–t–i–o–n–'–)–;––
– – – – –i–f– –(–!–b–t–n– –|–|– –!–s–e–c–t–i–o–n–)– –r–e–t–u–r–n–;––
––
– – – – –b–t–n–.–a–d–d–E–v–e–n–t–L–i–s–t–e–n–e–r–(–'–c–l–i–c–k–'–,– –(–)– –=–>– –{––
– – – – – – – – –s–e–c–t–i–o–n–.–s–c–r–o–l–l–I–n–t–o–V–i–e–w–(–{– –b–e–h–a–v–i–o–r–:– –'–s–m–o–o–t–h–'–,– –b–l–o–c–k–:– –'–s–t–a–r–t–'– –}–)–;––
– – – – –}–)–;––
–}––
––
–a–s–y–n–c– –f–u–n–c–t–i–o–n– –c–a–r–i–c–a–S–t–o–r–i–a–(–)– –{––
– – – – –c–o–n–s–t– –p–a–r–a–m–s– –=– –n–e–w– –U–R–L–S–e–a–r–c–h–P–a–r–a–m–s–(–w–i–n–d–o–w–.–l–o–c–a–t–i–o–n–.–s–e–a–r–c–h–)–;––
– – – – –c–o–n–s–t– –i–d– –=– –p–a–r–a–m–s–.–g–e–t–(–'–i–d–'–)–;––
––
– – – – –i–f– –(–!–i–d–)– –{––
– – – – – – – – –a–l–e–r–t–(–'–S–t–o–r–i–a– –n–o–n– –t–r–o–v–a–t–a–!–'–)–;––
– – – – – – – – –w–i–n–d–o–w–.–l–o–c–a–t–i–o–n–.–h–r–e–f– –=– –'–h–o–m–e–.–h–t–m–l–'–;––
– – – – – – – – –r–e–t–u–r–n–;––
– – – – –}––
––
– – – – –t–r–y– –{––
– – – – – – – – –c–o–n–s–t– –r–e–s– –=– –a–w–a–i–t– –f–e–t–c–h–(–`–/–a–p–i–/–s–t–o–r–i–e–/–$–{–i–d–}–`–)–;––
– – – – – – – – –i–f– –(–!–r–e–s–.–o–k–)– –t–h–r–o–w– –n–e–w– –E–r–r–o–r–(–'–S–t–o–r–i–a– –n–o–n– –t–r–o–v–a–t–a–'–)–;––
––
– – – – – – – – –c–o–n–s–t– –s–t–o–r–i–a– –=– –a–w–a–i–t– –r–e–s–.–j–s–o–n–(–)–;––
– – – – – – – – –c–u–r–r–e–n–t–S–t–o–r–y– –=– –s–t–o–r–i–a–;––
––
– – – – – – – – –d–o–c–u–m–e–n–t–.–t–i–t–l–e– –=– –`–P–l–o–t–t–y– –ï–¿–½– –$–{–s–t–o–r–i–a–.–t–i–t–o–l–o–}–`–;––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–h–e–r–o–C–o–v–e–r–'–)–.–s–r–c– –=– –s–t–o–r–i–a–.–i–m–g–S–t–o–r–i–a– –|–|– –'–i–m–g–/–s–t–o–r–y–-–1–.–j–p–g–'–;––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–h–e–r–o–T–i–t–l–e–'–)–.–t–e–x–t–C–o–n–t–e–n–t– –=– –s–t–o–r–i–a–.–t–i–t–o–l–o–;––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–h–e–r–o–G–e–n–r–e–'–)–.–t–e–x–t–C–o–n–t–e–n–t– –=– –s–t–o–r–i–a–.–g–e–n–e–r–e– –|–|– –'–G–e–n–e–r–a–l–e–'–;––
––
– – – – – – – – –c–o–n–s–t– –a–u–t–o–r–e–E–l– –=– –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–h–e–r–o–A–u–t–h–o–r–'–)–;––
– – – – – – – – –i–f– –(–s–t–o–r–i–a–.–a–u–t–o–r–e– –=–=–=– –'–A–u–t–o–r–e– –s–c–o–n–o–s–c–i–u–t–o–'–)– –{––
– – – – – – – – – – – – –a–u–t–o–r–e–E–l–.–t–e–x–t–C–o–n–t–e–n–t– –=– –'–A–u–t–o–r–e– –n–o–n– –t–r–o–v–a–t–o–'–;––
– – – – – – – – – – – – –a–u–t–o–r–e–E–l–.–r–e–m–o–v–e–A–t–t–r–i–b–u–t–e–(–'–h–r–e–f–'–)–;––
– – – – – – – – –}– –e–l–s–e– –{––
– – – – – – – – – – – – –a–u–t–o–r–e–E–l–.–t–e–x–t–C–o–n–t–e–n–t– –=– –s–t–o–r–i–a–.–a–u–t–o–r–e–;––
– – – – – – – – – – – – –a–u–t–o–r–e–E–l–.–h–r–e–f– –=– –`–u–s–e–r–.–h–t–m–l–?–i–d–=–$–{–s–t–o–r–i–a–.–i–d–U–t–e–n–t–e–}–`–;––
– – – – – – – – –}––
––
– – – – – – – – –c–o–n–s–t– –w–o–r–d–s– –=– –(–s–t–o–r–i–a–.–c–o–n–t–e–n–u–t–o– –|–|– –'–'–)–.–s–p–l–i–t–(–/–\–s–+–/–)–.–f–i–l–t–e–r–(–B–o–o–l–e–a–n–)–.–l–e–n–g–t–h–;––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–m–e–t–a–W–o–r–d–s–'–)–.–t–e–x–t–C–o–n–t–e–n–t– –=– –`–$–{–w–o–r–d–s–}– –p–a–r–o–l–e–`–;––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–m–e–t–a–R–e–a–d–T–i–m–e–'–)–.–t–e–x–t–C–o–n–t–e–n–t– –=– –`–$–{–M–a–t–h–.–m–a–x–(–1–,– –M–a–t–h–.–c–e–i–l–(–w–o–r–d–s– –/– –2–0–0–)–)–}– –m–i–n–`–;––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–m–e–t–a–V–i–e–w–s–'–)–.–t–e–x–t–C–o–n–t–e–n–t– –=– –s–t–o–r–i–a–.–n–L–i–k–e– –|–|– –0–;––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–l–i–k–e–C–o–u–n–t–'–)–.–t–e–x–t–C–o–n–t–e–n–t– –=– –s–t–o–r–i–a–.–n–L–i–k–e– –|–|– –0–;––
––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–m–e–t–a–R–a–t–i–n–g–'–)–.–t–e–x–t–C–o–n–t–e–n–t– –=– –s–t–o–r–i–a–.–r–a–t–i–n–g–M–e–d–i–o– –?– –S–t–r–i–n–g–(–s–t–o–r–i–a–.–r–a–t–i–n–g–M–e–d–i–o–)– –:– –'–ï–¿–½–'–;––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–s–t–o–r–y–S–u–m–m–a–r–y–'–)–.–t–e–x–t–C–o–n–t–e–n–t– –=– –s–t–o–r–i–a–.–d–e–s–c–r–i–z–i–o–n–e– –|–|– –'–N–e–s–s–u–n–a– –s–i–n–o–s–s–i– –d–i–s–p–o–n–i–b–i–l–e–.–'–;––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–s–t–o–r–y–E–n–d–T–i–t–l–e–'–)–.–t–e–x–t–C–o–n–t–e–n–t– –=– –s–t–o–r–i–a–.–t–i–t–o–l–o–;––
––
– – – – – – – – –c–o–n–s–t– –s–t–o–r–y–B–o–d–y– –=– –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–s–t–o–r–y–B–o–d–y–'–)–;––
– – – – – – – – –s–t–o–r–y–B–o–d–y–.–i–n–n–e–r–H–T–M–L– –=– –'–'–;––
––
– – – – – – – – –c–o–n–s–t– –b–l–o–c–k–s– –=– –(–s–t–o–r–i–a–.–c–o–n–t–e–n–u–t–o– –|–|– –'–'–)–.–s–p–l–i–t–(–/–\–n–\–n–+–/–)–;––
– – – – – – – – –b–l–o–c–k–s–.–f–o–r–E–a–c–h–(–(–b–l–o–c–k–,– –i–)– –=–>– –{––
– – – – – – – – – – – – –c–o–n–s–t– –t–r–i–m–m–e–d– –=– –b–l–o–c–k–.–t–r–i–m–(–)–;––
– – – – – – – – – – – – –i–f– –(–!–t–r–i–m–m–e–d–)– –r–e–t–u–r–n–;––
– – – – – – – – – – – – –i–f– –(–t–r–i–m–m–e–d– –=–=–=– –'–[–*–*–*–]–'–)– –{––
– – – – – – – – – – – – – – – – –c–o–n–s–t– –s–e–p– –=– –d–o–c–u–m–e–n–t–.–c–r–e–a–t–e–E–l–e–m–e–n–t–(–'–p–'–)–;––
– – – – – – – – – – – – – – – – –s–e–p–.–c–l–a–s–s–N–a–m–e– –=– –'–s–c–e–n–e–-–b–r–e–a–k–'–;––
– – – – – – – – – – – – – – – – –s–e–p–.–t–e–x–t–C–o–n–t–e–n–t– –=– –'–❧– –❧– –❧–'–;––
– – – – – – – – – – – – – – – – –s–t–o–r–y–B–o–d–y–.–a–p–p–e–n–d–C–h–i–l–d–(–s–e–p–)–;––
– – – – – – – – – – – – –}– –e–l–s–e– –{––
– – – – – – – – – – – – – – – – –c–o–n–s–t– –p– –=– –d–o–c–u–m–e–n–t–.–c–r–e–a–t–e–E–l–e–m–e–n–t–(–'–p–'–)–;––
– – – – – – – – – – – – – – – – –p–.–t–e–x–t–C–o–n–t–e–n–t– –=– –t–r–i–m–m–e–d–;––
– – – – – – – – – – – – – – – – –p–.–s–t–y–l–e–.–a–n–i–m–a–t–i–o–n–D–e–l–a–y– –=– –`–$–{–i– –*– –0–.–0–4–}–s–`–;––
– – – – – – – – – – – – – – – – –s–t–o–r–y–B–o–d–y–.–a–p–p–e–n–d–C–h–i–l–d–(–p–)–;––
– – – – – – – – – – – – –}––
– – – – – – – – –}–)–;––
––
– – – – – – – – –d–o–c–u–m–e–n–t–.–g–e–t–E–l–e–m–e–n–t–B–y–I–d–(–'–s–t–o–r–y–E–n–d–'–)–.–s–t–y–l–e–.–d–i–s–p–l–a–y– –=– –'–f–l–e–x–'–;––
––
– – – – – – – – –b–i–n–d–L–i–k–e–(–i–d–)–;––
– – – – – – – – –b–i–n–d–B–o–o–k–m–a–r–k–(–i–d–)–;––
– – – – – – – – –b–i–n–d–C–o–m–m–e–n–t–S–c–r–o–l–l–(–)–;––
– – – – – – – – –b–i–n–d–R–e–v–i–e–w–F–o–r–m–(–i–d–)–;––
– – – – – – – – –l–o–a–d–R–e–v–i–e–w–s–(–i–d–)–;––
– – – – –}– –c–a–t–c–h– –(–e–r–r–)– –{––
– – – – – – – – –c–o–n–s–o–l–e–.–e–r–r–o–r–(–'–E–r–r–o–r–e– –n–e–l– –c–a–r–i–c–a–m–e–n–t–o– –d–e–l–l–a– –s–t–o–r–i–a–:–'–,– –e–r–r–)–;––
– – – – – – – – –a–l–e–r–t–(–'–E–r–r–o–r–e– –n–e–l– –c–a–r–i–c–a–m–e–n–t–o– –d–e–l–l–a– –s–t–o–r–i–a–!–'–)–;––
– – – – – – – – –w–i–n–d–o–w–.–l–o–c–a–t–i–o–n–.–h–r–e–f– –=– –'–h–o–m–e–.–h–t–m–l–'–;––
– – – – –}––
–}––
––
–d–o–c–u–m–e–n–t–.–a–d–d–E–v–e–n–t–L–i–s–t–e–n–e–r–(–'–D–O–M–C–o–n–t–e–n–t–L–o–a–d–e–d–'–,– –c–a–r–i–c–a–S–t–o–r–i–a–)–;––
––
–
