import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch, getDocs } from "firebase/firestore";

// --- CONFIGURAÇÃO DO FIREBASE (PERSONALIZA ESTOQUE) ---
const firebaseConfig = {
  apiKey: "AIzaSyAd935s7YlabjHU05Jdwzx4Ea3nNpW6afs",
  authDomain: "personaliza-estoque.firebaseapp.com",
  projectId: "personaliza-estoque",
  storageBucket: "personaliza-estoque.firebasestorage.app",
  messagingSenderId: "107806395570",
  appId: "1:107806395570:web:374b292845295c17f5cdab",
  measurementId: "G-ETE08VLKKV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "personaliza-estoque-v4";

const INITIAL_EMPLOYEES = [
  "Adilson", "Adriano", "Alan", "Alexandre", "Aline", "Amanda", "Ana", "Anderson", 
  "Antônio", "Beatriz", "Bruno", "Carlos", "Caroline", "César", "Daniel", "Danielle", 
  "Diego", "Eduardo", "Eliane", "Felipe", "Fernanda", "Flávia", "Gabriel", "Gabriela", 
  "Gustavo", "Igor", "Isabela", "João", "Jéssica", "Larissa", "Lucas", "Mariana", 
  "Matheus", "Natália", "Paulo", "Pedro", "Rafael", "Vinícius"
];

const SECTORS = ["SUBLIMAÇÃO", "MARCENARIA", "VIDRAÇARIA", "EPI"];

// [código, nome, setor, unidade, estoqueInicial, estoqueMinimo] - 320 produtos da planilha
const RAW_PRODUCTS = [
  ["56", "ADESIVO INST 100 G TEK BONB", "SUBLIMAÇÃO", "UN", 0.0, 5], ["84", "ASTE ABRE FACIL", "SUBLIMAÇÃO", "UN", 0.0, 5], ["60", "BOBINA DE PAPEL SEDA 1600X600 40 GRS", "SUBLIMAÇÃO", "UN", 0.0, 5], ["61", "BOBINA DE PAPEL TRATADO 1600X600 60GRS", "SUBLIMAÇÃO", "UN", 0.0, 5],
  ["102", "BOTÃO PARA JALECO TAM 28", "SUBLIMAÇÃO", "UN", 0.0, 5], ["10", "CARTUCHO DE LIMPEZA", "SUBLIMAÇÃO", "UN", 0.0, 5], ["103", "CORDÃO ELLO PARA BOLSINHA", "SUBLIMAÇÃO", "UN", 0.0, 5], ["83", "ELASTICO", "SUBLIMAÇÃO", "UN", 0.0, 5],
  ["104", "FIO DE LINHA PARA COSTURA", "SUBLIMAÇÃO", "UN", 0.0, 5], ["105", "SACO DE EMBALAGEM 32 X 40", "SUBLIMAÇÃO", "UN", 0.0, 5], ["106", "SACO DE EMBALAGEM 50 X 40", "SUBLIMAÇÃO", "UN", 0.0, 5], ["107", "SILVER TAP", "SUBLIMAÇÃO", "UN", 0.0, 5],
  ["158", "SUPORTE WIND BANNER", "SUBLIMAÇÃO", "UN", 0.0, 5], ["7", "TECIDO DE MALHA JERSEY LIGTH", "SUBLIMAÇÃO", "UN", 0.0, 5], ["86", "TECIDO PLANO OXFORD STRETCH", "SUBLIMAÇÃO", "UN", 0.0, 5], ["55", "TECIDO PLANO OXFORD STRETCH SUPER", "SUBLIMAÇÃO", "UN", 0.0, 5],
  ["166", "TECIDO PLANO OXFORD STRETCH SUPER PRETO", "SUBLIMAÇÃO", "UN", 0.0, 5], ["49", "TINTA AMARELA 1 LITRO TS-100", "SUBLIMAÇÃO", "UN", 4.0, 5], ["8", "TINTA AMARELA 2 LITROS MIMAKI JV 150-160", "SUBLIMAÇÃO", "UN", 0.0, 5], ["253", "TINTA AMARELA GALÃO DE 10 KG", "SUBLIMAÇÃO", "UN", 0.0, 5],
  ["51", "TINTA AZUL 1 LITRO TS-100", "SUBLIMAÇÃO", "UN", 10.0, 5], ["72", "TINTA AZUL 2 LITROS MIMAK JV150-160", "SUBLIMAÇÃO", "UN", 0.0, 5], ["250", "TINTA AZUL GALÃO DE 10 KG", "SUBLIMAÇÃO", "UN", 0.0, 5], ["46", "TINTA BLACK PRETA 2L MIMAKI JV150-160", "SUBLIMAÇÃO", "UN", 0.0, 5],
  ["48", "TINTA MAGENTA 1 L TS-100", "SUBLIMAÇÃO", "UN", 5.0, 5], ["9", "TINTA MAGENTA 2 LITROS MIMAK JV 150-160", "SUBLIMAÇÃO", "UN", 0.0, 5], ["252", "TINTA MAGENTA GALÃO DE 10 KG", "SUBLIMAÇÃO", "UN", 0.0, 5], ["52", "TINTA PRETA 1 LITRO TS-100", "SUBLIMAÇÃO", "UN", 4.0, 5],
  ["251", "TINTA PRETA GALÃO DE 10 KG", "SUBLIMAÇÃO", "UN", 0.0, 5], ["141", "ADESIVO CONTATO 2,80", "MARCENARIA", "UN", 0.0, 5], ["56", "ADESIVO INST 100 G TEK BONB", "MARCENARIA", "UN", 15.0, 5], ["201", "ADESIVO QUIMIONAL SPRAY 8330 13KG/18LT", "MARCENARIA", "UN", 0.0, 5],
  ["129", "ADESIVO QUIMIONAL SPRAY 8330 18 LTS", "MARCENARIA", "UN", 0.0, 5], ["168", "ÁGUA RAZ EUCATEX 5LTS 1 GL", "MARCENARIA", "UN", 0.0, 5], ["88", "AGUARRAS 1 LITRO EUCATEX", "MARCENARIA", "UN", 0.0, 5], ["142", "AGUARRAS EUCATEX 18 LITROS", "MARCENARIA", "UN", 0.0, 5],
  ["118", "ARRUELA GRANDA", "MARCENARIA", "UN", 0.0, 5], ["117", "ARRUELA PEQUENA", "MARCENARIA", "UN", 0.0, 5], ["21", "BARRA CHATA....... 1 X 3 16", "MARCENARIA", "UN", 0.0, 5], ["19", "BARRA CHATA..... 5 8 X 1 8", "MARCENARIA", "UN", 0.0, 5],
  ["5", "BARRA CHATA. 3 8 X 1 8", "MARCENARIA", "UN", 0.0, 5], ["15", "BARRA CHATA 1/4", "MARCENARIA", "UN", 0.0, 5], ["314", "BARRA CHATA 1 1/2X 3/16", "MARCENARIA", "UN", 0.0, 5], ["313", "BARRA CHATA 1 1/2 X 3/6", "MARCENARIA", "UN", 0.0, 5],
  ["13", "BARRA CHATA 1 X1/8", "MARCENARIA", "UN", 0.0, 5], ["298", "BARRA CHATA 2´ 3/16", "MARCENARIA", "UN", 0.0, 5], ["257", "BARRA CHATA 2 5/16 3M", "MARCENARIA", "UN", 0.0, 5], ["297", "BARRA CHATA 3/4X1/8", "MARCENARIA", "UN", 0.0, 5],
  ["12", "BARRA CHATA 5/8X1/8", "MARCENARIA", "UN", 0.0, 5], ["16", "BARRA REDONDA", "MARCENARIA", "UN", 0.0, 5], ["18", "BARRA REDONDA... 3 8 LISO", "MARCENARIA", "UN", 0.0, 5], ["23", "BARRA REDONDA.. 1 4 LISO", "MARCENARIA", "UN", 0.0, 5],
  ["172", "BASE DE MESA CONE", "MARCENARIA", "UN", 0.0, 5], ["185", "BASE DE MESA ESTRELA", "MARCENARIA", "UN", 0.0, 5], ["74", "BETUME LIQUIDO 5 LITROS", "MARCENARIA", "UN", 0.0, 5], ["148", "BOBINA DE PAPELAO ONDULADO", "MARCENARIA", "UN", 0.0, 5],
  ["318", "BRANCO FOSCO PU", "MARCENARIA", "UN", 0.0, 5], ["68", "BUCHA COMUM 6 CM", "MARCENARIA", "UN", 37.0, 5], ["171", "BUCHA W-MU PEAD C/ ANEL 6MM", "MARCENARIA", "UN", 0.0, 5], ["153", "CADEIRA ESTOFADA", "MARCENARIA", "UN", 0.0, 5],
  ["159", "CAIXA 01- 600X210X50", "MARCENARIA", "UN", 0.0, 5], ["187", "CAIXA 02 -500X350X180", "MARCENARIA", "UN", 0.0, 5], ["152", "CAIXA 03-800X210X60 PAPELÃO", "MARCENARIA", "UN", 0.0, 5], ["89", "CAIXA 05 CADEIRA FORDOS C/ 10 UNIDADES", "MARCENARIA", "UN", 0.0, 5],
  ["284", "CAIXA 06- 1010X210X50 20 UNIDADES POR FARDO", "MARCENARIA", "UN", 0.0, 5], ["285", "CAIXA 07- 1210X310X50 20 UNIDADES POR FARDO", "MARCENARIA", "UN", 0.0, 5], ["274", "CAIXA 08- 2010X160X50", "MARCENARIA", "UN", 0.0, 5], ["275", "CAIXA 09 - 2010X210X50", "MARCENARIA", "UN", 0.0, 5],
  ["276", "CAIXA 10- 2010X260X50", "MARCENARIA", "UN", 0.0, 5], ["286", "CAIXA 11- 2010X310X50", "MARCENARIA", "UN", 0.0, 5], ["277", "CAIXA 12 - 2010X360X50", "MARCENARIA", "UN", 0.0, 5], ["120", "CAIXA DE EMBALGEM PARA MESA PÉ DE CEBOLA MENOR", "MARCENARIA", "UN", 0.0, 5],
  ["119", "CAIXA EMBALAGEM PARA MESA PÉ DE CEBOLA MAIOR", "MARCENARIA", "UN", 0.0, 5], ["75", "CERA P MOVEIS 2,4 KGS INCOLOR", "MARCENARIA", "UN", 0.0, 5], ["236", "CHAPA GALVANIZADA 28 2 X 1,20", "MARCENARIA", "UN", 0.0, 5], ["32", "CHAPA MADEIRA BRANCA", "MARCENARIA", "UN", 0.0, 5],
  ["91", "COLA DE MADEIRA GALÃO DE 5 KGS", "MARCENARIA", "UN", 0.0, 5], ["3", "ELETR ACO CARB 2,5MM E6013 5KG", "MARCENARIA", "UN", 0.0, 5], ["41", "ELTRO ACO CRAB 2,5MM", "MARCENARIA", "UN", 0.0, 5], ["232", "ESA 14 NEW - P - 0,41 X 0,41 X 0,03 M ACENTO", "MARCENARIA", "UN", 0.0, 5],
  ["124", "ESPUMA D20 BRANCA L400 01 CM", "MARCENARIA", "UN", 0.0, 5], ["125", "ESPUMA D33 LARANJA L900 05 CM", "MARCENARIA", "UN", 0.0, 5], ["76", "EUCALUX PRETO FOSCO 3,6L", "MARCENARIA", "UN", 0.0, 5], ["31", "EUCATEX 3MM 2,33X0,50", "MARCENARIA", "UN", 0.0, 5],
  ["327", "EUCATEX BRANCO FOSCO", "MARCENARIA", "UN", 0.0, 5], ["289", "EUCATEX QUEROSENE 1L", "MARCENARIA", "UN", 0.0, 5], ["130", "FECHO ROLETE", "MARCENARIA", "UN", 0.0, 5], ["58", "FITA ADESIVA AA40", "MARCENARIA", "UN", 0.0, 5],
  ["99", "FITA DUPLA FACE GROSSA", "MARCENARIA", "UN", 0.0, 5], ["208", "GRAMPO ESTOFAMENTO 80.13 CX 15.750", "MARCENARIA", "UN", 0.0, 5], ["209", "GRAMPO ESTRUTURAL 14.38", "MARCENARIA", "UN", 0.0, 5], ["202", "GRAMPO ESTRUTUTAL 14/35 CX COM 14.400", "MARCENARIA", "UN", 0.0, 5],
  ["126", "GRAMPO IMECO 1 4/45 CX CM 11,840", "MARCENARIA", "UN", 0.0, 5], ["77", "LACXE RAZ AGUARRAZ 18 LITROS", "MARCENARIA", "UN", 0.0, 5], ["127", "LINHO PARMA 25 CRU/CINZA NEBLIMA", "MARCENARIA", "UN", 0.0, 5], ["110", "LONA PRETA", "MARCENARIA", "UN", 0.0, 5],
  ["26", "MADEIRA 30X4CM", "MARCENARIA", "UN", 0.0, 5], ["147", "MADEIRA 35X2,5X3", "MARCENARIA", "UN", 0.0, 5], ["204", "MADEIRA DE PINUS 35X2,5X3,00", "MARCENARIA", "UN", 0.0, 5], ["301", "MADEIRA P/ LAREIRA", "MARCENARIA", "UN", 0.0, 5],
  ["203", "MADEIRA PINUS 12X5,5X3,00", "MARCENARIA", "UN", 0.0, 5], ["36", "MADEIRA PINUS 15X2,5X3", "MARCENARIA", "UN", 0.0, 5], ["40", "MADEIRA PINUS 15X4,0X3", "MARCENARIA", "UN", 0.0, 5], ["35", "MADEIRA PINUS 20X2,5X3", "MARCENARIA", "UN", 0.0, 5],
  ["39", "MADEIRA PINUS 20X4,0X3", "MARCENARIA", "UN", 0.0, 5], ["205", "MADEIRA PINUS 20X5,5X3,00", "MARCENARIA", "UN", 0.0, 5], ["38", "MADEIRA PINUS 25,40X3", "MARCENARIA", "UN", 0.0, 5], ["34", "MADEIRA PINUS 25X2,5X3", "MARCENARIA", "UN", 0.0, 5],
  ["33", "MADEIRA PINUS 30X2,5X3", "MARCENARIA", "UN", 0.0, 5], ["37", "MADEIRA PINUS 30X4,0X3", "MARCENARIA", "UN", 0.0, 5], ["179", "MADEIRA PINUS 35X4.0X3", "MARCENARIA", "UN", 0.0, 5], ["260", "MADEIRA PINUS 6,5 X 6,5 X 3,00", "MARCENARIA", "UN", 0.0, 5],
  ["123", "MALHA DE EMBALAGEM", "MARCENARIA", "UN", 0.0, 5], ["188", "MASSA MADEIRA IMBUIA", "MARCENARIA", "UN", 0.0, 5], ["79", "MASSA PARA MADEIRA BRANCA", "MARCENARIA", "UN", 0.0, 5], ["144", "MDF 15MM BRANCO", "MARCENARIA", "UN", 0.0, 5],
  ["160", "MDF BRANCO 12MM", "MARCENARIA", "UN", 0.0, 5], ["182", "MDF BRANCO 18MM", "MARCENARIA", "UN", 0.0, 5], ["155", "MDF CRU 3MM CORRETO", "MARCENARIA", "UN", 0.0, 5], ["121", "MESA PÉ DE CEBOLA 35CM", "MARCENARIA", "UN", 0.0, 5],
  ["310", "METALON 15X15", "MARCENARIA", "UN", 0.0, 5], ["98", "METALON 20X20", "MARCENARIA", "UN", 0.0, 5], ["227", "METALON 80X40X16", "MARCENARIA", "UN", 0.0, 5], ["200", "PARAFUSO 3,5X20MM", "MARCENARIA", "UN", 0.0, 5],
  ["199", "PARAFUSO 4,5X16MM", "MARCENARIA", "UN", 0.0, 5], ["111", "PARAFUSO 4,5X60", "MARCENARIA", "UN", 0.0, 5], ["315", "PARAFUSO 4X25", "MARCENARIA", "UN", 0.0, 5], ["114", "PARAFUSO CHIP 3,5X16", "MARCENARIA", "UN", 0.0, 5],
  ["279", "PARAFUSO CHIP 42X13", "MARCENARIA", "UN", 0.0, 5], ["278", "PARAFUSO CHIP 5,0X30", "MARCENARIA", "UN", 10.0, 5], ["196", "PARAFUSO CHIP 5,0X40", "MARCENARIA", "UN", 0.0, 5], ["254", "PARAFUSO CHIP 5,0 X 70CM", "MARCENARIA", "UN", 0.0, 5],
  ["195", "PARAFUSO CHIP 5,0X80MM", "MARCENARIA", "UN", 0.0, 5], ["65", "PARAFUSO CHIP CHA 3,5X14", "MARCENARIA", "UN", 5.0, 5], ["66", "PARAFUSO CHIP CHA 3,5X16", "MARCENARIA", "UN", 0.0, 5], ["67", "PARAFUSO CHIP CHA 4X40", "MARCENARIA", "UN", 0.0, 5],
  ["302", "PERFIL U 3XCH 14", "MARCENARIA", "UN", 0.0, 5], ["42", "PF CHIP RP CB CH PH BC", "MARCENARIA", "UN", 0.0, 5], ["149", "PINOS PINADORES 3,5", "MARCENARIA", "UN", 0.0, 5], ["150", "PINOS PINADORES 4,5", "MARCENARIA", "UN", 0.0, 5],
  ["151", "PINOS PINADORES 5", "MARCENARIA", "UN", 0.0, 5], ["316", "PRETO FOSCO PU", "MARCENARIA", "UN", 0.0, 5], ["183", "PRIMER UNIVERSAL CINZA", "MARCENARIA", "UN", 0.0, 5], ["78", "QUEROLACXE", "MARCENARIA", "UN", 0.0, 5],
  ["146", "QUEROSENE EUCATEX 5 L", "MARCENARIA", "UN", 0.0, 5], ["180", "ROLAMENTO DE MESA 94X94MM", "MARCENARIA", "UN", 0.0, 5], ["43", "ROST OFF INDUSTRY", "MARCENARIA", "UN", 0.0, 5], ["186", "SELADORA EUCATEX EXTRA 18L", "MARCENARIA", "UN", 0.0, 5],
  ["69", "TABUA DE MADEIRA 20 X 4", "MARCENARIA", "UN", 0.0, 5], ["122", "TAMPO MESA PÉ DE CEBOLA", "MARCENARIA", "UN", 0.0, 5], ["234", "THINER ACABAMENTO 5 L EUCATEX 9800", "MARCENARIA", "UN", 0.0, 5], ["170", "THINNER LIMPEZA 5LT EUCATEX 9100 1GL", "MARCENARIA", "UN", 0.0, 5],
  ["100", "TINTA EUCATEX 3,600 LT", "MARCENARIA", "UN", 0.0, 5], ["128", "TNT 40/1,40 PRETO", "MARCENARIA", "UN", 0.0, 5], ["311", "TUBO RED 31.75 (1.1/4)", "MARCENARIA", "UN", 0.0, 5], ["312", "TUBO RED 38.10(1.1/2)", "MARCENARIA", "UN", 0.0, 5],
  ["164", "ZARCAO LARANJA EUCATEX", "MARCENARIA", "UN", 0.0, 5], ["44", "01.002.0029 ESPELHO PRO INCOLOR 03MM", "VIDRAÇARIA", "UN", 0.0, 5], ["201", "ADESIVO QUIMIONAL SPRAY 8330 13KG/18LT", "VIDRAÇARIA", "UN", 0.0, 5], ["129", "ADESIVO QUIMIONAL SPRAY 8330 18 LTS", "VIDRAÇARIA", "UN", 0.0, 5],
  ["304", "APARADOR CANTO", "VIDRAÇARIA", "UN", 0.0, 5], ["305", "APARADOR CENTRO", "VIDRAÇARIA", "UN", 0.0, 5], ["242", "ASSENTO CADEIRA NOVA 0,406 X 0,383 X 0,05", "VIDRAÇARIA", "UN", 0.0, 5], ["172", "BASE DE MESA CONE", "VIDRAÇARIA", "UN", 0.0, 5],
  ["185", "BASE DE MESA ESTRELA", "VIDRAÇARIA", "UN", 0.0, 5], ["68", "BUCHA COMUM 6 CM", "VIDRAÇARIA", "UN", 0.0, 5], ["153", "CADEIRA ESTOFADA", "VIDRAÇARIA", "UN", 0.0, 5], ["159", "CAIXA 01- 600X210X50", "VIDRAÇARIA", "UN", 0.0, 5],
  ["187", "CAIXA 02 -500X350X180", "VIDRAÇARIA", "UN", 0.0, 5], ["152", "CAIXA 03-800X210X60 PAPELÃO", "VIDRAÇARIA", "UN", 0.0, 5], ["89", "CAIXA 05 CADEIRA FORDOS C/ 10 UNIDADES", "VIDRAÇARIA", "UN", 0.0, 5], ["198", "CANCELADO", "VIDRAÇARIA", "UN", 0.0, 5],
  ["59", "CANCELADO,,", "VIDRAÇARIA", "UN", 0.0, 5], ["293", "CAVILHA 10 X 50MM (PACOTE COM 500 )", "VIDRAÇARIA", "UN", 0.0, 5], ["64", "CHAPA DE ESPELHO 3MM AVILSA 2,20X3,210", "VIDRAÇARIA", "UN", 0.0, 5], ["194", "CHAPA DE ESPELHO 3MM AVILSA 2,40X3,210", "VIDRAÇARIA", "UN", 0.0, 5],
  ["32", "CHAPA MADEIRA BRANCA", "VIDRAÇARIA", "UN", 0.0, 5], ["91", "COLA DE MADEIRA GALÃO DE 5 KGS", "VIDRAÇARIA", "UN", 0.0, 5], ["294", "COLA TECK BONDER", "VIDRAÇARIA", "UN", 0.0, 5], ["63", "CONECTOR MAGUEIRA DE LED", "VIDRAÇARIA", "UN", 0.0, 5],
  ["223", "CONPENSADO PARICA NAVEL 15", "VIDRAÇARIA", "UN", 0.0, 5], ["116", "CORREDIÇA", "VIDRAÇARIA", "UN", 0.0, 5], ["131", "DOBRADIÇA", "VIDRAÇARIA", "UN", 0.0, 5], ["243", "ENCOSTO CADEIRA NOVA 0,40 X 0,20 X 0,05", "VIDRAÇARIA", "UN", 0.0, 5],
  ["233", "ESA 10 NEW - M - 5 X 1,9 X 0,008 M MANTA", "VIDRAÇARIA", "UN", 0.0, 5], ["231", "ESA 12 NEW P 0,41 X 0,48 X 0,02 ENCOSTO", "VIDRAÇARIA", "UN", 0.0, 5], ["232", "ESA 14 NEW - P - 0,41 X 0,41 X 0,03 M ACENTO", "VIDRAÇARIA", "UN", 0.0, 5], ["245", "ESA 339 AD-P 0,4 X 0,2 X 0,05M", "VIDRAÇARIA", "UN", 0.0, 5],
  ["246", "ESA CT21 F -P 0,406 X 0,383 X 0,05M", "VIDRAÇARIA", "UN", 0.0, 5], ["108", "ESPELHO 4 MM", "VIDRAÇARIA", "UN", 0.0, 5], ["133", "ESPELHO BRONZE", "VIDRAÇARIA", "UN", 0.0, 5], ["132", "ESPELHO FUME", "VIDRAÇARIA", "UN", 0.0, 5],
  ["54", "ESPELHO PRO INCOLOR 04MM", "VIDRAÇARIA", "UN", 0.0, 5], ["239", "ESPUMA 0,41 X 0,418X 0,02", "VIDRAÇARIA", "UN", 0.0, 5], ["244", "ESPUMA 0,41 X 0,41 X 0,03.", "VIDRAÇARIA", "UN", 0.0, 5], ["268", "ESPUMA D18 BRANCA LB 0.8MM COM 5 MTS", "VIDRAÇARIA", "UN", 0.0, 5],
  ["124", "ESPUMA D20 BRANCA L400 01 CM", "VIDRAÇARIA", "UN", 0.0, 5], ["125", "ESPUMA D33 LARANJA L900 05 CM", "VIDRAÇARIA", "UN", 0.0, 5], ["76", "EUCALUX PRETO FOSCO 3,6L", "VIDRAÇARIA", "UN", 0.0, 5], ["92", "EUCATEX 1,21 X 2,12", "VIDRAÇARIA", "UN", 0.0, 5],
  ["93", "EUCATEX 1,22 X 1,22", "VIDRAÇARIA", "UN", 0.0, 5], ["31", "EUCATEX 3MM 2,33X0,50", "VIDRAÇARIA", "UN", 0.0, 5], ["327", "EUCATEX BRANCO FOSCO", "VIDRAÇARIA", "UN", 0.0, 5], ["112", "FELTRO ADESIVO", "VIDRAÇARIA", "UN", 0.0, 5],
  ["237", "FEMIA DE SAPATA PARA MESA PÉ DE CEBOLA", "VIDRAÇARIA", "UN", 0.0, 5], ["264", "FERRO MECANICO 1/4-1,6", "VIDRAÇARIA", "UN", 0.0, 5], ["58", "FITA ADESIVA AA40", "VIDRAÇARIA", "UN", 0.0, 5], ["272", "FITA CREPE FINA", "VIDRAÇARIA", "UN", 0.0, 5],
  ["273", "FITA CREPE GROSSA", "VIDRAÇARIA", "UN", 0.0, 5], ["181", "FITA DE LED A PILHA", "VIDRAÇARIA", "UN", 0.0, 5], ["184", "FITA DE LED FRIO A PILHA", "VIDRAÇARIA", "UN", 0.0, 5], ["109", "FITA DUPLA FACE FINA", "VIDRAÇARIA", "UN", 0.0, 5],
  ["99", "FITA DUPLA FACE GROSSA", "VIDRAÇARIA", "UN", 0.0, 5], ["4", "FIXA ESPELHO BRANCO 400G", "VIDRAÇARIA", "UN", 0.0, 5], ["173", "GRAMPO 80/14 15.670", "VIDRAÇARIA", "UN", 0.0, 5], ["208", "GRAMPO ESTOFAMENTO 80.13 CX 15.750", "VIDRAÇARIA", "UN", 0.0, 5],
  ["202", "GRAMPO ESTRUTUTAL 14/35 CX COM 14.400", "VIDRAÇARIA", "UN", 0.0, 5], ["115", "GRAMPO GRAMPEADOR 80/14 C/8250PEÇAS", "VIDRAÇARIA", "UN", 0.0, 5], ["224", "GRAMPO P/GRAMPEADOR 80/16 C-7500 PEÇAS", "VIDRAÇARIA", "UN", 0.0, 5], ["306", "LAMPADA 15W", "VIDRAÇARIA", "UN", 0.0, 5],
  ["323", "MADEIRA PINUS 10 X 4 X 3,0", "VIDRAÇARIA", "UN", 0.0, 5], ["123", "MALHA DE EMBALAGEM", "VIDRAÇARIA", "UN", 0.0, 5], ["240", "MANTAS 0,008 FATIADAS", "VIDRAÇARIA", "UN", 0.0, 5], ["241", "MANTAS FATIADAS COM 10 CM E 40 MANTAS FATIADAS COM 66 CM", "VIDRAÇARIA", "UN", 0.0, 5],
  ["303", "MDF 12MM 275X244", "VIDRAÇARIA", "UN", 0.0, 5], ["30", "MDF 12MM CRU 275X220 CORRETO", "VIDRAÇARIA", "UN", 0.0, 5], ["144", "MDF 15MM BRANCO", "VIDRAÇARIA", "UN", 0.0, 5], ["154", "MDF 2,8MM CRU 275X213", "VIDRAÇARIA", "UN", 0.0, 5],
  ["182", "MDF BRANCO 18MM", "VIDRAÇARIA", "UN", 0.0, 5], ["321", "MDF BRANCO OR 2F 09MM", "VIDRAÇARIA", "UN", 0.0, 5], ["213", "MDF BRANCO OR 2F CORRETO 18MM", "VIDRAÇARIA", "UN", 0.0, 5], ["222", "MDF CRU 06MM CORRETO", "VIDRAÇARIA", "UN", 0.0, 5],
  ["94", "MDF CRU 12MM 1,84X2,75", "VIDRAÇARIA", "UN", 0.0, 5], ["96", "MDF CRU 12MM2,20X2,75", "VIDRAÇARIA", "UN", 0.0, 5], ["167", "MDF CRU 18MM", "VIDRAÇARIA", "UN", 0.0, 5], ["178", "MDF CRU 25MM 2,80X1,90", "VIDRAÇARIA", "UN", 0.0, 5],
  ["189", "MDF CRU 25MM 2,80X2,20", "VIDRAÇARIA", "UN", 0.0, 5], ["155", "MDF CRU 3MM CORRETO", "VIDRAÇARIA", "UN", 0.0, 5], ["229", "MDF CRU LIXADO 6,00X1850X2750", "VIDRAÇARIA", "UN", 0.0, 5], ["214", "MDF PRETO 15MM 2F", "VIDRAÇARIA", "UN", 0.0, 5],
  ["121", "MESA PÉ DE CEBOLA 35CM", "VIDRAÇARIA", "UN", 0.0, 5], ["215", "MESA PÉ DE CEBOLA 40 CM", "VIDRAÇARIA", "UN", 0.0, 5], ["263", "MESA PÉ DE CEBOLA 50 CM", "VIDRAÇARIA", "UN", 0.0, 5], ["219", "MESA PE DE CEBOLA 60 CM", "VIDRAÇARIA", "UN", 0.0, 5],
  ["218", "MESA PÉ DE CEBOLA 70CM", "VIDRAÇARIA", "UN", 0.0, 5], ["267", "METALON 50X30XCH 18-8,95", "VIDRAÇARIA", "UN", 0.0, 5], ["134", "MOLDURA DE ESPELHO PRATA", "VIDRAÇARIA", "UN", 0.0, 5], ["135", "MOLDURA DE ESPELHO PRETA", "VIDRAÇARIA", "UN", 0.0, 5],
  ["114", "PARAFUSO CHIP 3,5X16", "VIDRAÇARIA", "UN", 0.0, 5], ["196", "PARAFUSO CHIP 5,0X40", "VIDRAÇARIA", "UN", 0.0, 5], ["65", "PARAFUSO CHIP CHA 3,5X14", "VIDRAÇARIA", "UN", 0.0, 5], ["197", "PARAFUSO P/ PUXADOR 4X18MM", "VIDRAÇARIA", "UN", 0.0, 5],
  ["280", "PÉ DE CADEIRA FRENTE 44X4X3", "VIDRAÇARIA", "UN", 0.0, 5], ["216", "PÉ DE CADEIRA TRASEIRO 52X4X3", "VIDRAÇARIA", "UN", 0.0, 5], ["291", "PE DE CEBOLA 10CM", "VIDRAÇARIA", "UN", 0.0, 5], ["288", "PEGADOR DE CADEIRA", "VIDRAÇARIA", "UN", 0.0, 5],
  ["175", "PELÍCULA BRANCA", "VIDRAÇARIA", "UN", 0.0, 5], ["177", "PELÍCULA DE MARMÓRE", "VIDRAÇARIA", "UN", 0.0, 5], ["176", "PELÍCULA PRETA", "VIDRAÇARIA", "UN", 0.0, 5], ["22", "PERFIL(01) SIMPLES 45 X 17....", "VIDRAÇARIA", "UN", 0.0, 5],
  ["292", "PERFIL TUB 61 X 54MM X 2MTS", "VIDRAÇARIA", "UN", 0.0, 5], ["221", "PERFIL TUB C/ CORTE 5 X 22 X 2 MTS", "VIDRAÇARIA", "UN", 0.0, 5], ["220", "PERFIL TUB C CORTE 10 X 22 X 2 PCT C/100", "VIDRAÇARIA", "UN", 0.0, 5], ["157", "PINO DE 20MM", "VIDRAÇARIA", "UN", 0.0, 5],
  ["149", "PINOS PINADORES 3,5", "VIDRAÇARIA", "UN", 0.0, 5], ["151", "PINOS PINADORES 5", "VIDRAÇARIA", "UN", 0.0, 5], ["248", "PINTURA PÉ DE CADEIRA", "VIDRAÇARIA", "UN", 0.0, 5], ["156", "PLACA DE ISOPOR GROSSA 2250X100X35MM", "VIDRAÇARIA", "UN", 0.0, 5],
  ["225", "PLACA DE ISOPOR QUADRADINHO 2250 X 40 X 35MM", "VIDRAÇARIA", "UN", 0.0, 5], ["87", "PLACAS DE ISOPOR", "VIDRAÇARIA", "UN", 0.0, 5], ["212", "PLACAS DE ISOPOR FINA 2250 X 100 X12MM", "VIDRAÇARIA", "UN", 0.0, 5], ["136", "PLASTICO FILME", "VIDRAÇARIA", "UN", 0.0, 5],
  ["137", "PLASTICO FILME AMARELO", "VIDRAÇARIA", "UN", 0.0, 5], ["249", "POLTRONA OPALA", "VIDRAÇARIA", "UN", 0.0, 5], ["316", "PRETO FOSCO PU", "VIDRAÇARIA", "UN", 0.0, 5], ["281", "PUXADOR 42X4X3", "VIDRAÇARIA", "UN", 0.0, 5],
  ["81", "PUXADOR DE CRISTAL 30MM", "VIDRAÇARIA", "UN", 0.0, 5], ["161", "PUXADOR DE CRISTAL 30MM DOURADO", "VIDRAÇARIA", "UN", 0.0, 5], ["146", "QUEROSENE EUCATEX 5 L", "VIDRAÇARIA", "UN", 0.0, 5], ["113", "RODINHAS DE CABECEIRA", "VIDRAÇARIA", "UN", 0.0, 5],
  ["180", "ROLAMENTO DE MESA 94X94MM", "VIDRAÇARIA", "UN", 0.0, 5], ["80", "ROLO DE LED C/ 100 METROS QUENTE 110V", "VIDRAÇARIA", "UN", 0.0, 5], ["163", "ROLO DE LED C/ 100 METROS QUENTE 220V", "VIDRAÇARIA", "UN", 0.0, 5], ["162", "ROLO DE LED FRIO C/ 100 METROS 110V", "VIDRAÇARIA", "UN", 0.0, 5],
  ["165", "ROLO DE LED FRIO C/ 100 METROS 220V", "VIDRAÇARIA", "UN", 0.0, 5], ["299", "SACO DE EMBALAGEM 15X20", "VIDRAÇARIA", "UN", 0.0, 5], ["324", "SAPATA GRANDE 5/16 X 7/8", "VIDRAÇARIA", "UN", 0.0, 5], ["322", "SAPATA ROSCA METÁLICA PEQUENA 1/4", "VIDRAÇARIA", "UN", 0.0, 5],
  ["186", "SELADORA EUCATEX EXTRA 18L", "VIDRAÇARIA", "UN", 0.0, 5], ["169", "SELADORA EXTRA 3,6LT EUCATEX 1GL", "VIDRAÇARIA", "UN", 0.0, 5], ["138", "SILICONE ACETICO 260G PRETO", "VIDRAÇARIA", "UN", 0.0, 5], ["139", "SILICONE ACETICO 280ML WHURT", "VIDRAÇARIA", "UN", 0.0, 5],
  ["270", "SILICONE BRONZE", "VIDRAÇARIA", "UN", 0.0, 5], ["271", "SILICONE CINZA", "VIDRAÇARIA", "UN", 0.0, 5], ["174", "SILICONE INCOLOR WURTH", "VIDRAÇARIA", "UN", 0.0, 5], ["309", "SOBRE TAMPO", "VIDRAÇARIA", "UN", 0.0, 5],
  ["228", "SUPORTE ESPELHO ORGANICO", "VIDRAÇARIA", "UN", 0.0, 5], ["283", "TAMPA DE MESA 1M", "VIDRAÇARIA", "UN", 0.0, 5], ["282", "TAMPA DE MESA 90CM", "VIDRAÇARIA", "UN", 0.0, 5], ["308", "TAMPA PLASTICA 20X20", "VIDRAÇARIA", "UN", 0.0, 5],
  ["307", "TAMPA PLASTICA 50X30", "VIDRAÇARIA", "UN", 0.0, 5], ["325", "TAMPO DE METALON 50X20", "VIDRAÇARIA", "UN", 0.0, 5], ["122", "TAMPO MESA PÉ DE CEBOLA", "VIDRAÇARIA", "UN", 0.0, 5], ["255", "TECIDO LINHA SATURNO 12 NATURAL", "VIDRAÇARIA", "UN", 0.0, 5],
  ["207", "TECIDO LINHO SATURNO 07 GELO", "VIDRAÇARIA", "UN", 0.0, 5], ["230", "TECIDO LINHO SATURNO 13 TERRACOTA", "VIDRAÇARIA", "UN", 0.0, 5], ["247", "TECIDO MARFIM INCA CORTEX", "VIDRAÇARIA", "UN", 0.0, 5], ["295", "TECIDO RATAN", "VIDRAÇARIA", "UN", 0.0, 5],
  ["210", "TECIDO VELUDO INCA CASTOR", "VIDRAÇARIA", "UN", 0.0, 5], ["206", "TECIDO VELUDO INCA PRETO", "VIDRAÇARIA", "UN", 0.0, 5], ["211", "TECIDO VELUDO INCA SALMÃO", "VIDRAÇARIA", "UN", 0.0, 5], ["256", "TECIDO VELUDO INCA VERDE", "VIDRAÇARIA", "UN", 0.0, 5],
  ["234", "THINER ACABAMENTO 5 L EUCATEX 9800", "VIDRAÇARIA", "UN", 0.0, 5], ["296", "THINNER ACABAMENTO 9800 18L", "VIDRAÇARIA", "UN", 0.0, 5], ["170", "THINNER LIMPEZA 5LT EUCATEX 9100 1GL", "VIDRAÇARIA", "UN", 0.0, 5], ["300", "TINTA DOURADA", "VIDRAÇARIA", "UN", 0.0, 5],
  ["326", "TINTA PRATA", "VIDRAÇARIA", "UN", 0.0, 5], ["128", "TNT 40/1,40 PRETO", "VIDRAÇARIA", "UN", 0.0, 5], ["266", "T UBO 3/4 X CH 20 - 2,56", "VIDRAÇARIA", "UN", 0.0, 5], ["265", "T UBO 5/8 X CH20-2,15", "VIDRAÇARIA", "UN", 0.0, 5]
];

export default function App() {
  const [activeTab, setActiveTab] = useState('estoque');
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Filtros de Estoque
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('Todos');
  const [filterClassification, setFilterClassification] = useState('Todas');

  // Modais e Formulários de Produto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formSector, setFormSector] = useState('SUBLIMAÇÃO');
  const [formUnit, setFormUnit] = useState('UN');
  const [formClassification, setFormClassification] = useState('Matéria Prima');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formInitialStock, setFormInitialStock] = useState('0');

  // Modal e Pesquisa de Movimentação (Por Setor, Código e Nome)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveType, setMoveType] = useState('Entrada');
  const [moveSectorFilter, setMoveSectorFilter] = useState('Todos');
  const [moveSearchQuery, setMoveSearchQuery] = useState('');
  const [moveProductId, setMoveProductId] = useState('');
  const [moveQty, setMoveQty] = useState('1');
  const [moveEmployee, setMoveEmployee] = useState('');
  const [moveNote, setMoveNote] = useState('');

  // Modal e Pesquisa da Aba de Compras
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchSectorFilter, setPurchSectorFilter] = useState('Todos');
  const [purchSearchQuery, setPurchSearchQuery] = useState('');
  const [purchProductId, setPurchProductId] = useState('');
  const [purchQtyToBuy, setPurchQtyToBuy] = useState('5');
  const [purchSupplier, setPurchSupplier] = useState('');
  const [purchNote, setPurchNote] = useState('');
  const [purchStatusFilter, setPurchStatusFilter] = useState('Todos');

  // Gestão de Funcionários
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [selectedEmpForHistory, setSelectedEmpForHistory] = useState('Todos');

  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.error("Erro Auth:", err));
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const prodRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const empRef = collection(db, 'artifacts', appId, 'public', 'data', 'employees');

    // Popular 320 produtos se ainda não tiver os 320 completos
    getDocs(prodRef).then(async (snapshot) => {
      if (snapshot.size < 320) {
        const batch = writeBatch(db);
        RAW_PRODUCTS.forEach((item, idx) => {
          const pId = 'prod_init_' + idx;
          const dRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', pId);
          batch.set(dRef, {
            code: item[0],
            name: item[1],
            sector: item[2],
            unit: item[3],
            stock: Number(item[4]) || 0,
            minStock: Number(item[5]) || 5,
            classification: 'Matéria Prima',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
        await batch.commit();
      }
    }).catch(err => console.error("Erro seed produtos:", err));

    // Popular funcionários iniciais se estiver vazio
    getDocs(empRef).then(async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_EMPLOYEES.forEach((empName, idx) => {
          const eId = 'emp_init_' + idx;
          batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'employees', eId), {
            name: empName,
            createdAt: new Date().toISOString()
          });
        });
        await batch.commit();
      }
    }).catch(err => console.error("Erro seed funcionários:", err));

    const unsubProd = onSnapshot(prodRef, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(list);
      if (list.length > 0 && !moveProductId) setMoveProductId(list[0].id);
      if (list.length > 0 && !purchProductId) setPurchProductId(list[0].id);
    });

    const unsubMov = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'movements'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMovements(list.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setLoading(false);
    });

    const unsubPurch = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'purchases'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPurchases(list.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
    });

    const unsubEmp = onSnapshot(empRef, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setEmployees(list);
      if (list.length > 0 && !moveEmployee) setMoveEmployee(list[0].name);
    });

    return () => {
      unsubProd();
      unsubMov();
      unsubPurch();
      unsubEmp();
    };
  }, [user]);

  // --- FUNÇÕES DE PRODUTOS ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const productId = editingProduct ? editingProduct.id : 'prod_' + Date.now();
    const productData = {
      code: formCode.trim() || '-',
      name: formName.trim().toUpperCase(),
      sector: formSector,
      unit: formUnit.trim() || 'UN',
      classification: formClassification,
      minStock: Number(formMinStock) || 0,
      stock: editingProduct ? Number(formInitialStock) : (Number(formInitialStock) || 0),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId), productData);
      closeModal();
    } catch (err) {
      alert("Erro ao salvar produto.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormCode('');
    setFormName('');
    setFormUnit('UN');
    setFormMinStock('5');
    setFormInitialStock('0');
    setFormClassification('Matéria Prima');
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setFormCode(prod.code || '');
    setFormName(prod.name);
    setFormSector(prod.sector);
    setFormUnit(prod.unit || 'UN');
    setFormClassification(prod.classification || 'Matéria Prima');
    setFormMinStock(prod.minStock);
    setFormInitialStock(prod.stock);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Tem certeza que deseja excluir este produto do sistema?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
    }
  };

  const handleUpdateField = async (prod, field, value) => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', prod.id), {
      ...prod,
      [field]: value,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  // --- FUNÇÕES DE MOVIMENTAÇÃO (COM FILTRO DE CÓDIGO, NOME E SETOR) ---
  const moveFilteredProducts = products.filter(p => {
    const matchSector = moveSectorFilter === 'Todos' || p.sector === moveSectorFilter;
    const q = moveSearchQuery.toLowerCase().trim();
    const matchQuery = !q || p.name.toLowerCase().includes(q) || String(p.code || '').toLowerCase().includes(q);
    return matchSector && matchQuery;
  });

  const handleSaveMovement = async (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === moveProductId) || moveFilteredProducts[0];
    if (!product) {
      alert("Selecione um produto válido na lista.");
      return;
    }

    const qtyNum = Number(moveQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      alert("Quantidade inválida.");
      return;
    }

    if (moveType === 'Saída' && product.stock < qtyNum) {
      alert(`Estoque insuficiente! Estoque disponível: ${product.stock}`);
      return;
    }

    const newStock = moveType === 'Entrada' ? product.stock + qtyNum : product.stock - qtyNum;

    try {
      const batch = writeBatch(db);
      const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', product.id);
      batch.update(prodRef, { stock: newStock, updatedAt: new Date().toISOString() });

      const movId = 'mov_' + Date.now();
      const movRef = doc(db, 'artifacts', appId, 'public', 'data', 'movements', movId);
      batch.set(movRef, {
        productId: product.id,
        productCode: product.code || '-',
        productName: product.name,
        sector: product.sector,
        classification: product.classification || 'Matéria Prima',
        type: moveType,
        qty: qtyNum,
        employee: moveType === 'Saída' ? (moveEmployee || '-') : '-',
        note: moveNote.trim() || '-',
        date: new Date().toISOString()
      });

      await batch.commit();
      setIsMoveModalOpen(false);
      setMoveNote('');
      setMoveQty('1');
      setMoveSearchQuery('');
    } catch (err) {
      alert("Erro ao salvar movimentação.");
    }
  };

  const handleDeleteMovement = async (mov) => {
    if (!confirm("Deseja estornar e apagar esta movimentação? O estoque será revertido.")) return;
    const product = products.find(p => p.id === mov.productId);
    const batch = writeBatch(db);
    if (product) {
      const restoredStock = mov.type === 'Entrada' ? product.stock - mov.qty : product.stock + mov.qty;
      batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'products', product.id), { stock: restoredStock });
    }
    batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'movements', mov.id));
    await batch.commit();
  };

  // --- FUNÇÕES DA ABA DE COMPRAS ---
  const purchFilteredProducts = products.filter(p => {
    const matchSector = purchSectorFilter === 'Todos' || p.sector === purchSectorFilter;
    const q = purchSearchQuery.toLowerCase().trim();
    const matchQuery = !q || p.name.toLowerCase().includes(q) || String(p.code || '').toLowerCase().includes(q);
    return matchSector && matchQuery;
  });

  const handleCreatePurchaseOrder = async (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === purchProductId) || purchFilteredProducts[0];
    if (!product) {
      alert("Selecione um produto válido.");
      return;
    }
    const qty = Number(purchQtyToBuy) || 1;
    const pId = 'purch_' + Date.now();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'purchases', pId), {
      productId: product.id,
      productCode: product.code || '-',
      productName: product.name,
      sector: product.sector,
      qtyToBuy: qty,
      supplier: purchSupplier.trim() || '-',
      orderDate: new Date().toISOString(),
      purchaseDate: null,
      qtyBought: 0,
      status: 'AGUARDANDO',
      note: purchNote.trim() || '-'
    });
    setIsPurchaseModalOpen(false);
    setPurchSupplier('');
    setPurchNote('');
    setPurchSearchQuery('');
  };

  const handleConfirmPurchaseReceived = async (purch) => {
    const inputQty = prompt(`Confirmar recebimento de "${purch.productName}".\nQuantidade comprada que entrará no estoque:`, purch.qtyToBuy);
    if (inputQty === null) return;
    const qtyBought = Number(inputQty);
    if (isNaN(qtyBought) || qtyBought <= 0) {
      alert("Informe uma quantidade válida maior que zero.");
      return;
    }

    const product = products.find(p => p.id === purch.productId);
    const batch = writeBatch(db);
    const nowIso = new Date().toISOString();

    // 1. Atualiza o pedido na aba Compras para COMPRADO
    batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'purchases', purch.id), {
      status: 'COMPRADO',
      qtyBought: qtyBought,
      purchaseDate: nowIso
    });

    // 2. Soma automaticamente no estoque do produto
    if (product) {
      batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'products', product.id), {
        stock: (Number(product.stock) || 0) + qtyBought,
        updatedAt: nowIso
      });
    }

    // 3. Lança entrada automática na Movimentação
    const movId = 'mov_purch_' + Date.now();
    batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'movements', movId), {
      productId: purch.productId,
      productCode: purch.productCode || '-',
      productName: purch.productName,
      sector: purch.sector,
      classification: product?.classification || 'Matéria Prima',
      type: 'Entrada',
      qty: qtyBought,
      employee: '-',
      note: `Entrada Automática de Compra (Fornecedor: ${purch.supplier || '-'})`,
      date: nowIso
    });

    await batch.commit();
  };

  const handleDeletePurchase = async (id) => {
    if (confirm("Deseja remover este item da lista de compras?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'purchases', id));
    }
  };

  const sendProductToPurchases = async (prod) => {
    const suggestedQty = Math.max(1, (prod.minStock || 5) - (prod.stock || 0));
    const pId = 'purch_' + Date.now();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'purchases', pId), {
      productId: prod.id,
      productCode: prod.code || '-',
      productName: prod.name,
      sector: prod.sector,
      qtyToBuy: suggestedQty,
      supplier: '-',
      orderDate: new Date().toISOString(),
      purchaseDate: null,
      qtyBought: 0,
      status: 'AGUARDANDO',
      note: 'Gerado por alerta de reposição'
    });
    alert(`"${prod.name}" enviado para a aba COMPRAS!`);
  };

  // --- FUNÇÕES DE FUNCIONÁRIOS ---
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;
    const eId = 'emp_' + Date.now();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', eId), {
      name: newEmployeeName.trim(),
      createdAt: new Date().toISOString()
    });
    setNewEmployeeName('');
  };

  const handleDeleteEmployee = async (emp) => {
    if (confirm(`Deseja excluir o funcionário "${emp.name}" da lista?`)) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', emp.id));
    }
  };

  // --- EXPORTAÇÃO CSV ---
  const exportCSV = () => {
    let csvContent = "\uFEFF";
    csvContent += "=== RELAÇÃO DE ENTRADAS DE PRODUTOS ===\n";
    csvContent += "Data/Hora;Código;Produto;Setor;Classificação;Quantidade;Observação\n";
    
    const entradas = movements.filter(m => m.type === 'Entrada');
    entradas.forEach(m => {
      csvContent += `"${new Date(m.date).toLocaleString('pt-BR')}";"${m.productCode || '-'}";"${m.productName}";"${m.sector}";"${m.classification || 'Matéria Prima'}";${m.qty};"${m.note}"\n`;
    });

    csvContent += "\n=== RELAÇÃO DE SAÍDAS E RETIRADAS / EPI ===\n";
    csvContent += "Data/Hora;Código;Produto;Setor;Classificação;Quantidade;Funcionário;Observação\n";
    
    const saidas = movements.filter(m => m.type === 'Saída');
    saidas.forEach(m => {
      csvContent += `"${new Date(m.date).toLocaleString('pt-BR')}";"${m.productCode || '-'}";"${m.productName}";"${m.sector}";"${m.classification || 'Matéria Prima'}";${m.qty};"${m.employee}";"${m.note}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_personaliza_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  // Filtros da Tabela Principal de Estoque (Por Nome, Código e Setor)
  const filteredProducts = products.filter(p => {
    const q = searchTerm.toLowerCase().trim();
    const matchNameOrCode = !q || p.name.toLowerCase().includes(q) || String(p.code || '').toLowerCase().includes(q);
    const matchSector = filterSector === 'Todos' || p.sector === filterSector;
    const matchClass = filterClassification === 'Todas' || (p.classification || 'Matéria Prima') === filterClassification;
    return matchNameOrCode && matchSector && matchClass;
  });

  const pendingPurchasesCount = purchases.filter(p => p.status === 'AGUARDANDO').length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2D1B12] text-[#FDFBF7] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl tracking-wide font-medium text-[#C5A880]">Personaliza - Sincronizando 320 Produtos e Setores...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D1B12] font-sans flex flex-col">
      <header className="bg-[#2D1B12] text-[#FDFBF7] border-b border-[#C5A880]/30 shadow-lg px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-[#FDFBF7]">PERSONALIZA</h1>
          <p className="text-xs text-[#C5A880] tracking-widest uppercase">Gestão Completa de Estoque, Compras e EPIs</p>
        </div>

        <nav className="flex flex-wrap gap-2 bg-[#1F120B] p-1.5 rounded-xl border border-[#C5A880]/20">
          <button onClick={() => setActiveTab('estoque')} className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'estoque' ? 'bg-[#C5A880] text-[#2D1B12] shadow' : 'text-[#FDFBF7]/80 hover:text-white'}`}>
            Estoque ({products.length})
          </button>
          <button onClick={() => setActiveTab('movimentacao')} className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'movimentacao' ? 'bg-[#C5A880] text-[#2D1B12] shadow' : 'text-[#FDFBF7]/80 hover:text-white'}`}>
            Movimentação ({movements.length})
          </button>
          <button onClick={() => setActiveTab('compras')} className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'compras' ? 'bg-[#C5A880] text-[#2D1B12] shadow' : 'text-[#FDFBF7]/80 hover:text-white'}`}>
            Compras {pendingPurchasesCount > 0 && `(${pendingPurchasesCount})`}
          </button>
          <button onClick={() => setActiveTab('funcionarios')} className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'funcionarios' ? 'bg-[#C5A880] text-[#2D1B12] shadow' : 'text-[#FDFBF7]/80 hover:text-white'}`}>
            Funcionários / EPI ({employees.length})
          </button>
          <button onClick={() => setActiveTab('resumo')} className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'resumo' ? 'bg-[#C5A880] text-[#2D1B12] shadow' : 'text-[#FDFBF7]/80 hover:text-white'}`}>
            Resumo e Relatórios {lowStockCount > 0 && `(${lowStockCount})`}
          </button>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {/* ABA 1: ESTOQUE POR SETOR */}
        {activeTab === 'estoque' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {['Todos', ...SECTORS].map(sec => (
                <button
                  key={sec}
                  onClick={() => setFilterSector(sec)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${filterSector === sec ? 'bg-[#2D1B12] text-[#FDFBF7] border-[#2D1B12]' : 'bg-white text-[#2D1B12] border-[#C5A880]/40 hover:bg-[#C5A880]/10'}`}
                >
                  {sec === 'Todos' ? `Todos (${products.length})` : `${sec} (${products.filter(p => p.sector === sec).length})`}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#C5A880]/20">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder="Pesquisar por código ou nome do produto..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 px-4 py-2 bg-[#FDFBF7] border border-[#C5A880]/40 rounded-xl text-sm focus:outline-none"
                />
                <select 
                  value={filterClassification} 
                  onChange={(e) => setFilterClassification(e.target.value)}
                  className="py-2 px-3 bg-[#FDFBF7] border border-[#C5A880]/40 rounded-xl text-sm"
                >
                  <option value="Todas">Todas Classificações</option>
                  <option value="Matéria Prima">Matéria Prima</option>
                  <option value="Consumo">Consumo</option>
                </select>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => { setMoveType('Entrada'); setMoveSectorFilter(filterSector); setIsMoveModalOpen(true); }}
                  className="bg-[#C5A880] text-[#2D1B12] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#b5966d] transition shadow"
                >
                  + Lançar Entrada/Saída
                </button>
                <button 
                  onClick={() => { setEditingProduct(null); setFormCode(''); setFormName(''); setFormSector(filterSector === 'Todos' ? 'SUBLIMAÇÃO' : filterSector); setFormMinStock('5'); setFormInitialStock('0'); setIsModalOpen(true); }}
                  className="bg-[#2D1B12] text-[#FDFBF7] px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3D261A] transition shadow"
                >
                  + Novo Produto
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#C5A880]/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#2D1B12]/5 text-[#2D1B12] border-b border-[#C5A880]/20 text-xs uppercase tracking-wider font-bold">
                      <th className="p-4">Código</th>
                      <th className="p-4">Descrição do Produto</th>
                      <th className="p-4">Setor</th>
                      <th className="p-4">Unid.</th>
                      <th className="p-4">Classificação</th>
                      <th className="p-4 text-center">Estoque Atual</th>
                      <th className="p-4 text-center">Est. Mínimo</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredProducts.length === 0 ? (
                      <tr><td colSpan="9" className="p-8 text-center text-gray-400">Nenhum produto encontrado para este filtro.</td></tr>
                    ) : (
                      filteredProducts.map(prod => {
                        const isLow = prod.stock <= prod.minStock;
                        return (
                          <tr key={prod.id} className="hover:bg-[#FDFBF7]/80 transition">
                            <td className="p-4 text-xs font-bold text-[#2D1B12] bg-gray-50/50">{prod.code || '-'}</td>
                            <td className="p-4 font-semibold text-[#2D1B12]">{prod.name}</td>
                            <td className="p-4">
                              <span className="bg-[#C5A880]/20 text-[#2D1B12] px-2.5 py-1 rounded-lg text-xs font-bold">{prod.sector}</span>
                            </td>
                            <td className="p-4 text-xs text-gray-500 font-bold">{prod.unit || 'UN'}</td>
                            <td className="p-4">
                              <select 
                                value={prod.classification || 'Matéria Prima'} 
                                onChange={(e) => handleUpdateField(prod, 'classification', e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium"
                              >
                                <option value="Matéria Prima">Matéria Prima</option>
                                <option value="Consumo">Consumo</option>
                              </select>
                            </td>
                            <td className="p-4 text-center font-bold text-base">{prod.stock}</td>
                            <td className="p-4 text-center">
                              <input 
                                type="number" 
                                defaultValue={prod.minStock} 
                                onBlur={(e) => handleUpdateField(prod, 'minStock', Number(e.target.value) || 0)}
                                className="w-16 text-center bg-gray-50 border border-gray-200 rounded-lg py-1 text-xs font-semibold"
                              />
                            </td>
                            <td className="p-4 text-center">
                              {isLow ? (
                                <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">REPOR</span>
                              ) : (
                                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">OK</span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-1 whitespace-nowrap">
                              <button onClick={() => sendProductToPurchases(prod)} title="Enviar para Lista de Compras" className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-200">Comprar</button>
                              <button onClick={() => openEditProduct(prod)} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200">Editar</button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100">Excluir</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: MOVIMENTAÇÃO */}
        {activeTab === 'movimentacao' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#C5A880]/20">
              <div>
                <h2 className="text-lg font-bold text-[#2D1B12]">Histórico de Entradas e Saídas</h2>
                <p className="text-xs text-gray-500">Pesquise o produto pelo código, nome ou setor na hora de lançar.</p>
              </div>
              <button 
                onClick={() => { setMoveType('Entrada'); setIsMoveModalOpen(true); }}
                className="bg-[#2D1B12] text-[#FDFBF7] px-5 py-2.5 rounded-xl font-semibold hover:bg-[#3D261A] transition shadow"
              >
                + Nova Movimentação (Entrada / Saída)
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#C5A880]/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#2D1B12]/5 text-[#2D1B12] border-b border-[#C5A880]/20 text-xs uppercase tracking-wider font-bold">
                      <th className="p-4">Data / Hora</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Cód.</th>
                      <th className="p-4">Produto</th>
                      <th className="p-4">Setor</th>
                      <th className="p-4 text-center">Qtd</th>
                      <th className="p-4">Funcionário (Retirada/EPI)</th>
                      <th className="p-4">Observação</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {movements.length === 0 ? (
                      <tr><td colSpan="9" className="p-8 text-center text-gray-400">Nenhuma movimentação registada.</td></tr>
                    ) : (
                      movements.map(mov => (
                        <tr key={mov.id} className="hover:bg-[#FDFBF7]/60 transition">
                          <td className="p-4 text-xs text-gray-500">{new Date(mov.date).toLocaleString('pt-BR')}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${mov.type === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {mov.type}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-bold text-gray-500">{mov.productCode || '-'}</td>
                          <td className="p-4 font-semibold text-[#2D1B12]">{mov.productName}</td>
                          <td className="p-4 text-xs font-bold text-gray-600">{mov.sector}</td>
                          <td className="p-4 text-center font-bold text-base">{mov.qty}</td>
                          <td className="p-4 text-xs font-bold text-[#2D1B12]">{mov.employee || '-'}</td>
                          <td className="p-4 text-xs text-gray-500">{mov.note}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDeleteMovement(mov)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">Estornar</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: COMPRAS (IGUAL À PLANILHA) */}
        {activeTab === 'compras' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-[#C5A880]/20">
              <div>
                <h2 className="text-lg font-bold text-[#2D1B12]">Gestão de Compras e Reposição</h2>
                <p className="text-xs text-gray-500">Liste o que precisa comprar. Ao clicar em "Confirmar Compra", a quantidade entra automaticamente no estoque!</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select 
                  value={purchStatusFilter} 
                  onChange={(e) => setPurchStatusFilter(e.target.value)}
                  className="py-2 px-3 bg-[#FDFBF7] border border-[#C5A880]/40 rounded-xl text-sm font-semibold"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="AGUARDANDO">Aguardando Compra</option>
                  <option value="COMPRADO">Comprado / Recebido</option>
                </select>
                <button 
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="bg-[#2D1B12] text-[#FDFBF7] px-5 py-2.5 rounded-xl font-semibold hover:bg-[#3D261A] transition shadow text-sm"
                >
                  + Adicionar Pedido de Compra
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#C5A880]/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#2D1B12]/5 text-[#2D1B12] border-b border-[#C5A880]/20 text-xs uppercase tracking-wider font-bold">
                      <th className="p-4">Data Pedido</th>
                      <th className="p-4">Setor</th>
                      <th className="p-4">Cód.</th>
                      <th className="p-4">Descrição</th>
                      <th className="p-4 text-center">Qtd a Comprar</th>
                      <th className="p-4">Fornecedor</th>
                      <th className="p-4">Data Compra</th>
                      <th className="p-4 text-center">Qtd Comprada</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {purchases.filter(p => purchStatusFilter === 'Todos' || p.status === purchStatusFilter).length === 0 ? (
                      <tr><td colSpan="10" className="p-8 text-center text-gray-400">Nenhum pedido de compra registado.</td></tr>
                    ) : (
                      purchases
                        .filter(p => purchStatusFilter === 'Todos' || p.status === purchStatusFilter)
                        .map(purch => (
                          <tr key={purch.id} className="hover:bg-[#FDFBF7]/60 transition">
                            <td className="p-4 text-xs text-gray-500">{new Date(purch.orderDate).toLocaleDateString('pt-BR')}</td>
                            <td className="p-4 text-xs font-bold">{purch.sector}</td>
                            <td className="p-4 text-xs font-bold text-gray-500">{purch.productCode}</td>
                            <td className="p-4 font-semibold text-[#2D1B12]">{purch.productName}</td>
                            <td className="p-4 text-center font-bold">{purch.qtyToBuy}</td>
                            <td className="p-4 text-xs text-gray-600">{purch.supplier}</td>
                            <td className="p-4 text-xs text-gray-500">{purch.purchaseDate ? new Date(purch.purchaseDate).toLocaleDateString('pt-BR') : '-'}</td>
                            <td className="p-4 text-center font-bold text-green-700">{purch.qtyBought || '-'}</td>
                            <td className="p-4 text-center">
                              {purch.status === 'COMPRADO' ? (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">COMPRADO</span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">AGUARDANDO</span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                              {purch.status === 'AGUARDANDO' && (
                                <button 
                                  onClick={() => handleConfirmPurchaseReceived(purch)} 
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm"
                                >
                                  Confirmar Compra
                                </button>
                              )}
                              <button onClick={() => handleDeletePurchase(purch.id)} className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">Excluir</button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: FUNCIONÁRIOS E CONTROLE DE EPI */}
        {activeTab === 'funcionarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C5A880]/20 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#2D1B12]">Equipa de Funcionários ({employees.length})</h2>
                <p className="text-xs text-gray-500">Adicione ou remova colaboradores para o registo de EPIs e retiradas.</p>
              </div>

              <form onSubmit={handleAddEmployee} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nome do novo funcionário..." 
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#FDFBF7] border border-[#C5A880]/40 rounded-xl text-sm focus:outline-none"
                />
                <button type="submit" className="bg-[#2D1B12] text-[#FDFBF7] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#3D261A]">
                  + Adicionar
                </button>
              </form>

              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 border rounded-xl">
                {employees.map(emp => (
                  <div key={emp.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                    <button 
                      onClick={() => setSelectedEmpForHistory(emp.name)}
                      className={`text-sm font-semibold text-left flex-1 ${selectedEmpForHistory === emp.name ? 'text-[#C5A880] font-bold underline' : 'text-[#2D1B12]'}`}
                    >
                      {emp.name}
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(emp)}
                      className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded font-semibold"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#C5A880]/20 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#2D1B12]">Histórico de Retiradas / EPIs por Funcionário</h3>
                  <p className="text-xs text-gray-500">Selecione um funcionário ao lado ou no filtro para ver tudo o que ele retirou.</p>
                </div>
                <select 
                  value={selectedEmpForHistory}
                  onChange={(e) => setSelectedEmpForHistory(e.target.value)}
                  className="p-2 bg-[#FDFBF7] border border-[#C5A880]/40 rounded-xl text-sm font-bold"
                >
                  <option value="Todos">Todos os Funcionários</option>
                  {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-xs uppercase font-bold">
                      <th className="p-3">Data</th>
                      <th className="p-3">Funcionário</th>
                      <th className="p-3">Cód.</th>
                      <th className="p-3">Produto / EPI</th>
                      <th className="p-3">Setor</th>
                      <th className="p-3 text-center">Qtd</th>
                      <th className="p-3">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movements
                      .filter(m => m.type === 'Saída' && m.employee && m.employee !== '-' && (selectedEmpForHistory === 'Todos' || m.employee === selectedEmpForHistory))
                      .map(m => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="p-3 text-xs text-gray-500">{new Date(m.date).toLocaleString('pt-BR')}</td>
                          <td className="p-3 font-bold text-[#2D1B12]">{m.employee}</td>
                          <td className="p-3 text-xs text-gray-500">{m.productCode || '-'}</td>
                          <td className="p-3 font-semibold">{m.productName}</td>
                          <td className="p-3 text-xs">{m.sector}</td>
                          <td className="p-3 text-center font-bold text-orange-700">-{m.qty}</td>
                          <td className="p-3 text-xs text-gray-500">{m.note}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: RESUMO E RELATÓRIOS */}
        {activeTab === 'resumo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {SECTORS.map(sec => {
                const secProds = products.filter(p => p.sector === sec);
                const secLow = secProds.filter(p => p.stock <= p.minStock).length;
                return (
                  <div key={sec} className="bg-white p-5 rounded-2xl shadow-sm border border-[#C5A880]/20">
                    <p className="text-xs font-bold text-gray-500 uppercase">{sec}</p>
                    <p className="text-2xl font-bold text-[#2D1B12] mt-1">{secProds.length} itens</p>
                    <p className="text-xs font-semibold text-red-600 mt-1">{secLow} a repor</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#C5A880]/20">
              <div>
                <h2 className="text-xl font-bold text-[#2D1B12]">Exportação de Relatórios (12 Meses)</h2>
                <p className="text-xs text-gray-500">Exporte toda a relação de Entradas, Saídas e Retiradas por Funcionário para Excel.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={exportCSV} className="bg-[#C5A880] text-[#2D1B12] px-4 py-2.5 rounded-xl font-bold hover:bg-[#B3976F] transition shadow text-sm">
                  Baixar Planilha Excel (.CSV)
                </button>
                <button onClick={() => window.print()} className="bg-[#2D1B12] text-[#FDFBF7] px-4 py-2.5 rounded-xl font-semibold hover:bg-[#3D261A] transition shadow text-sm">
                  Imprimir / Salvar PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL CADASTRAR / EDITAR PRODUTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-[#2D1B12]">{editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 font-bold">X</button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Código</label>
                  <input type="text" value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="Ex: 56" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Setor</label>
                  <select value={formSector} onChange={(e) => setFormSector(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold">
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descrição do Produto</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: ADESIVO INST 100 G" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unidade</label>
                  <input type="text" value={formUnit} onChange={(e) => setFormUnit(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Est. Atual</label>
                  <input type="number" step="any" required value={formInitialStock} onChange={(e) => setFormInitialStock(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Est. Mínimo</label>
                  <input type="number" required value={formMinStock} onChange={(e) => setFormMinStock(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl border text-sm font-semibold">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#2D1B12] text-[#FDFBF7] text-sm font-semibold shadow">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LANÇAR MOVIMENTAÇÃO (COM BUSCA POR CÓDIGO, NOME E SETOR) */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-[#2D1B12]">Lançar Entrada ou Saída de Estoque</h3>
              <button onClick={() => setIsMoveModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold">X</button>
            </div>
            <form onSubmit={handleSaveMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">1. Filtrar Setor</label>
                  <select 
                    value={moveSectorFilter} 
                    onChange={(e) => {
                      setMoveSectorFilter(e.target.value);
                      const first = products.find(p => e.target.value === 'Todos' || p.sector === e.target.value);
                      if (first) setMoveProductId(first.id);
                    }} 
                    className="w-full p-3 bg-[#FDFBF7] border border-[#C5A880]/50 rounded-xl text-sm font-bold"
                  >
                    <option value="Todos">Todos os Setores</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">2. Buscar Código ou Nome</label>
                  <input 
                    type="text" 
                    value={moveSearchQuery} 
                    onChange={(e) => {
                      setMoveSearchQuery(e.target.value);
                      const q = e.target.value.toLowerCase().trim();
                      const first = products.find(p => (moveSectorFilter === 'Todos' || p.sector === moveSectorFilter) && (p.name.toLowerCase().includes(q) || String(p.code || '').toLowerCase() === q));
                      if (first) setMoveProductId(first.id);
                    }} 
                    placeholder="Digite cód (ex: 51) ou nome..." 
                    className="w-full p-3 bg-[#FDFBF7] border border-[#C5A880]/50 rounded-xl text-sm font-semibold" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">3. Produto Selecionado ({moveFilteredProducts.length} encontrados)</label>
                <select 
                  value={moveProductId} 
                  onChange={(e) => setMoveProductId(e.target.value)} 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                >
                  {moveFilteredProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} ({p.sector}) — Saldo: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Lançamento</label>
                  <select value={moveType} onChange={(e) => setMoveType(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold">
                    <option value="Entrada">Entrada (Compra / Retorno)</option>
                    <option value="Saída">Saída (Uso / Retirada EPI)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantidade</label>
                  <input type="number" step="any" min="0.01" required value={moveQty} onChange={(e) => setMoveQty(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
              </div>

              {moveType === 'Saída' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Funcionário que Retirou (Obrigatório para EPI)</label>
                  <select value={moveEmployee} onChange={(e) => setMoveEmployee(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold">
                    <option value="-">Sem funcionário específico</option>
                    {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Observação</label>
                <input type="text" value={moveNote} onChange={(e) => setMoveNote(e.target.value)} placeholder="Nota fiscal, fornecedor ou motivo..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsMoveModalOpen(false)} className="px-4 py-2 rounded-xl border text-sm font-semibold">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#2D1B12] text-[#FDFBF7] text-sm font-semibold shadow">Confirmar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO PEDIDO DE COMPRA */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-[#2D1B12]">Novo Pedido de Compra</h3>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold">X</button>
            </div>
            <form onSubmit={handleCreatePurchaseOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Filtrar Setor</label>
                  <select 
                    value={purchSectorFilter} 
                    onChange={(e) => {
                      setPurchSectorFilter(e.target.value);
                      const first = products.find(p => e.target.value === 'Todos' || p.sector === e.target.value);
                      if (first) setPurchProductId(first.id);
                    }} 
                    className="w-full p-3 bg-[#FDFBF7] border border-[#C5A880]/50 rounded-xl text-sm font-bold"
                  >
                    <option value="Todos">Todos os Setores</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Buscar por Código ou Nome</label>
                  <input 
                    type="text" 
                    value={purchSearchQuery} 
                    onChange={(e) => {
                      setPurchSearchQuery(e.target.value);
                      const q = e.target.value.toLowerCase().trim();
                      const first = products.find(p => (purchSectorFilter === 'Todos' || p.sector === purchSectorFilter) && (p.name.toLowerCase().includes(q) || String(p.code || '').toLowerCase() === q));
                      if (first) setPurchProductId(first.id);
                    }} 
                    placeholder="Digite código ou nome..." 
                    className="w-full p-3 bg-[#FDFBF7] border border-[#C5A880]/50 rounded-xl text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Produto a Comprar</label>
                <select value={purchProductId} onChange={(e) => setPurchProductId(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold">
                  {purchFilteredProducts.map(p => (
                    <option key={p.id} value={p.id}>[{p.code}] {p.name} ({p.sector}) — Est. Atual: {p.stock}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantidade a Comprar</label>
                  <input type="number" min="1" required value={purchQtyToBuy} onChange={(e) => setPurchQtyToBuy(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fornecedor (Opcional)</label>
                  <input type="text" value={purchSupplier} onChange={(e) => setPurchSupplier(e.target.value)} placeholder="Nome do fornecedor..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="px-4 py-2 rounded-xl border text-sm font-semibold">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#2D1B12] text-[#FDFBF7] text-sm font-semibold shadow">Registar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
