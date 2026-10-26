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
const appId = "personaliza-estoque-v2"; // Versão atualizada para forçar a carga completa

const EMPLOYEES_LIST = [
  "Adilson", "Adriano", "Alan", "Alexandre", "Aline", "Amanda", "Ana", "Anderson", 
  "Antônio", "Beatriz", "Bruno", "Carlos", "Caroline", "César", "Daniel", "Danielle", 
  "Diego", "Eduardo", "Eliane", "Felipe", "Fernanda", "Flávia", "Gabriel", "Gabriela", 
  "Gustavo", "Igor", "Isabela", "João", "Jéssica", "Larissa", "Lucas", "Mariana", 
  "Matheus", "Natália", "Paulo", "Pedro", "Rafael", "Vinícius"
];

const SECTORS = ["SUBLIMAÇÃO", "MARCENARIA", "VIDRAÇARIA", "EPI"];

// 320 Produtos extraídos da planilha CONTROLE_ESTOQUE_PROTEGIDO.xlsx
const INITIAL_PRODUCTS = [
  {
    "code": "56",
    "name": "ADESIVO INST 100 G TEK BONB",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "84",
    "name": "ASTE ABRE FACIL",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "60",
    "name": "BOBINA DE PAPEL SEDA 1600X600 40 GRS",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "61",
    "name": "BOBINA DE PAPEL TRATADO 1600X600 60GRS",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "102",
    "name": "BOTÃO PARA JALECO TAM 28",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "10",
    "name": "CARTUCHO DE LIMPEZA",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "103",
    "name": "CORDÃO ELLO PARA BOLSINHA",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "83",
    "name": "ELASTICO",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "104",
    "name": "FIO DE LINHA PARA COSTURA",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "105",
    "name": "SACO DE EMBALAGEM 32 X 40",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "106",
    "name": "SACO DE EMBALAGEM 50 X 40",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "107",
    "name": "SILVER TAP",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "158",
    "name": "SUPORTE WIND BANNER",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "7",
    "name": "TECIDO DE MALHA JERSEY LIGTH",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "86",
    "name": "TECIDO PLANO OXFORD STRETCH",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "55",
    "name": "TECIDO PLANO OXFORD STRETCH SUPER",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "166",
    "name": "TECIDO PLANO OXFORD STRETCH SUPER PRETO",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "49",
    "name": "TINTA AMARELA 1 LITRO TS-100",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 4.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "8",
    "name": "TINTA AMARELA 2 LITROS MIMAKI JV 150-160",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "253",
    "name": "TINTA AMARELA GALÃO DE 10 KG",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "51",
    "name": "TINTA AZUL 1 LITRO TS-100",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 10.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "72",
    "name": "TINTA AZUL 2 LITROS MIMAK JV150-160",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "250",
    "name": "TINTA AZUL GALÃO DE 10 KG",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "46",
    "name": "TINTA BLACK PRETA 2L MIMAKI JV150-160",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "48",
    "name": "TINTA MAGENTA 1 L TS-100",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 5.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "9",
    "name": "TINTA MAGENTA 2 LITROS MIMAK JV 150-160",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "252",
    "name": "TINTA MAGENTA GALÃO DE 10 KG",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "52",
    "name": "TINTA PRETA 1 LITRO TS-100",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 4.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "251",
    "name": "TINTA PRETA GALÃO DE 10 KG",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "141",
    "name": "ADESIVO CONTATO 2,80",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "56",
    "name": "ADESIVO INST 100 G TEK BONB",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 15.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "201",
    "name": "ADESIVO QUIMIONAL SPRAY 8330 13KG/18LT",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "129",
    "name": "ADESIVO QUIMIONAL SPRAY 8330 18 LTS",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "168",
    "name": "ÁGUA RAZ EUCATEX 5LTS 1 GL",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "88",
    "name": "AGUARRAS 1 LITRO EUCATEX",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "142",
    "name": "AGUARRAS EUCATEX 18 LITROS",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "118",
    "name": "ARRUELA GRANDA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "117",
    "name": "ARRUELA PEQUENA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "21",
    "name": "BARRA CHATA....... 1 X 3 16",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "19",
    "name": "BARRA CHATA..... 5 8 X 1 8",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "5",
    "name": "BARRA CHATA. 3 8 X 1 8",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "15",
    "name": "BARRA CHATA 1/4",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "314",
    "name": "BARRA CHATA 1 1/2X 3/16",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "313",
    "name": "BARRA CHATA 1 1/2 X 3/6",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "13",
    "name": "BARRA CHATA 1 X1/8",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "298",
    "name": "BARRA CHATA 2´ 3/16",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "257",
    "name": "BARRA CHATA 2 5/16 3M",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "297",
    "name": "BARRA CHATA 3/4X1/8",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "12",
    "name": "BARRA CHATA 5/8X1/8",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "16",
    "name": "BARRA REDONDA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "18",
    "name": "BARRA REDONDA... 3 8 LISO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "23",
    "name": "BARRA REDONDA.. 1 4 LISO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "172",
    "name": "BASE DE MESA CONE",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "185",
    "name": "BASE DE MESA ESTRELA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "74",
    "name": "BETUME LIQUIDO 5 LITROS",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "148",
    "name": "BOBINA DE PAPELAO ONDULADO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "318",
    "name": "BRANCO FOSCO PU",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "68",
    "name": "BUCHA COMUM 6 CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 37.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "171",
    "name": "BUCHA W-MU PEAD C/ ANEL 6MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "153",
    "name": "CADEIRA ESTOFADA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "159",
    "name": "CAIXA 01- 600X210X50",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "187",
    "name": "CAIXA 02 -500X350X180",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "152",
    "name": "CAIXA 03-800X210X60 PAPELÃO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "89",
    "name": "CAIXA 05 CADEIRA FORDOS C/ 10 UNIDADES",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "284",
    "name": "CAIXA 06- 1010X210X50 20 UNIDADES POR FARDO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "285",
    "name": "CAIXA 07- 1210X310X50 20 UNIDADES POR FARDO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "274",
    "name": "CAIXA 08- 2010X160X50",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "275",
    "name": "CAIXA 09 - 2010X210X50",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "276",
    "name": "CAIXA 10- 2010X260X50",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "286",
    "name": "CAIXA 11- 2010X310X50",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "277",
    "name": "CAIXA 12 - 2010X360X50",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "120",
    "name": "CAIXA DE EMBALGEM PARA MESA PÉ DE CEBOLA MENOR",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "119",
    "name": "CAIXA EMBALAGEM PARA MESA PÉ DE CEBOLA MAIOR",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "75",
    "name": "CERA P MOVEIS 2,4 KGS INCOLOR",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "236",
    "name": "CHAPA GALVANIZADA 28 2 X 1,20",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "32",
    "name": "CHAPA MADEIRA BRANCA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "91",
    "name": "COLA DE MADEIRA GALÃO DE 5 KGS",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "3",
    "name": "ELETR ACO CARB 2,5MM E6013 5KG",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "41",
    "name": "ELTRO ACO CRAB 2,5MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "232",
    "name": "ESA 14 NEW - P - 0,41 X 0,41 X 0,03 M ACENTO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "124",
    "name": "ESPUMA D20 BRANCA L400 01 CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "125",
    "name": "ESPUMA D33 LARANJA L900 05 CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "76",
    "name": "EUCALUX PRETO FOSCO 3,6L",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "31",
    "name": "EUCATEX 3MM 2,33X0,50",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "327",
    "name": "EUCATEX BRANCO FOSCO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "289",
    "name": "EUCATEX QUEROSENE 1L",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "130",
    "name": "FECHO ROLETE",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "58",
    "name": "FITA ADESIVA AA40",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "99",
    "name": "FITA DUPLA FACE GROSSA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "208",
    "name": "GRAMPO ESTOFAMENTO 80.13 CX 15.750",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "209",
    "name": "GRAMPO ESTRUTURAL 14.38",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "202",
    "name": "GRAMPO ESTRUTUTAL 14/35 CX COM 14.400",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "126",
    "name": "GRAMPO IMECO 1 4/45 CX CM 11,840",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "77",
    "name": "LACXE RAZ AGUARRAZ 18 LITROS",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "127",
    "name": "LINHO PARMA 25 CRU/CINZA NEBLIMA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "110",
    "name": "LONA PRETA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "26",
    "name": "MADEIRA 30X4CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "147",
    "name": "MADEIRA 35X2,5X3",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "204",
    "name": "MADEIRA DE PINUS 35X2,5X3,00",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "301",
    "name": "MADEIRA P/ LAREIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "203",
    "name": "MADEIRA PINUS 12X5,5X3,00",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "36",
    "name": "MADEIRA PINUS 15X2,5X3",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "40",
    "name": "MADEIRA PINUS 15X4,0X3",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "35",
    "name": "MADEIRA PINUS 20X2,5X3",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "39",
    "name": "MADEIRA PINUS 20X4,0X3",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "205",
    "name": "MADEIRA PINUS 20X5,5X3,00",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "38",
    "name": "MADEIRA PINUS 25,40X3",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "34",
    "name": "MADEIRA PINUS 25X2,5X3",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "33",
    "name": "MADEIRA PINUS 30X2,5X3",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "37",
    "name": "MADEIRA PINUS 30X4,0X3",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "179",
    "name": "MADEIRA PINUS 35X4.0X3",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "260",
    "name": "MADEIRA PINUS 6,5 X 6,5 X 3,00",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "123",
    "name": "MALHA DE EMBALAGEM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "188",
    "name": "MASSA MADEIRA IMBUIA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "79",
    "name": "MASSA PARA MADEIRA BRANCA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "144",
    "name": "MDF 15MM BRANCO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "160",
    "name": "MDF BRANCO 12MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "182",
    "name": "MDF BRANCO 18MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "155",
    "name": "MDF CRU 3MM CORRETO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "121",
    "name": "MESA PÉ DE CEBOLA 35CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "310",
    "name": "METALON 15X15",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "98",
    "name": "METALON 20X20",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "227",
    "name": "METALON 80X40X16",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "200",
    "name": "PARAFUSO 3,5X20MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "199",
    "name": "PARAFUSO 4,5X16MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "111",
    "name": "PARAFUSO 4,5X60",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "315",
    "name": "PARAFUSO 4X25",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "114",
    "name": "PARAFUSO CHIP 3,5X16",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "279",
    "name": "PARAFUSO CHIP 42X13",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "278",
    "name": "PARAFUSO CHIP 5,0X30",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 10.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "196",
    "name": "PARAFUSO CHIP 5,0X40",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "254",
    "name": "PARAFUSO CHIP 5,0 X 70CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "195",
    "name": "PARAFUSO CHIP 5,0X80MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "65",
    "name": "PARAFUSO CHIP CHA 3,5X14",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 5.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "66",
    "name": "PARAFUSO CHIP CHA 3,5X16",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "67",
    "name": "PARAFUSO CHIP CHA 4X40",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "302",
    "name": "PERFIL U 3XCH 14",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "42",
    "name": "PF CHIP RP CB CH PH BC",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "149",
    "name": "PINOS PINADORES 3,5",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "150",
    "name": "PINOS PINADORES 4,5",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "151",
    "name": "PINOS PINADORES 5",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "316",
    "name": "PRETO FOSCO PU",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "183",
    "name": "PRIMER UNIVERSAL CINZA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "78",
    "name": "QUEROLACXE",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "146",
    "name": "QUEROSENE EUCATEX 5 L",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "180",
    "name": "ROLAMENTO DE MESA 94X94MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "43",
    "name": "ROST OFF INDUSTRY",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "186",
    "name": "SELADORA EUCATEX EXTRA 18L",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "69",
    "name": "TABUA DE MADEIRA 20 X 4",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "122",
    "name": "TAMPO MESA PÉ DE CEBOLA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "234",
    "name": "THINER ACABAMENTO 5 L EUCATEX 9800",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "170",
    "name": "THINNER LIMPEZA 5LT EUCATEX 9100 1GL",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "100",
    "name": "TINTA EUCATEX 3,600 LT",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "128",
    "name": "TNT 40/1,40 PRETO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "311",
    "name": "TUBO RED 31.75 (1.1/4)",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "312",
    "name": "TUBO RED 38.10(1.1/2)",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "164",
    "name": "ZARCAO LARANJA EUCATEX",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "44",
    "name": "01.002.0029 ESPELHO PRO INCOLOR 03MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "201",
    "name": "ADESIVO QUIMIONAL SPRAY 8330 13KG/18LT",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "129",
    "name": "ADESIVO QUIMIONAL SPRAY 8330 18 LTS",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "304",
    "name": "APARADOR CANTO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "305",
    "name": "APARADOR CENTRO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "242",
    "name": "ASSENTO CADEIRA NOVA 0,406 X 0,383 X 0,05",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "172",
    "name": "BASE DE MESA CONE",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "185",
    "name": "BASE DE MESA ESTRELA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "68",
    "name": "BUCHA COMUM 6 CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "153",
    "name": "CADEIRA ESTOFADA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "159",
    "name": "CAIXA 01- 600X210X50",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "187",
    "name": "CAIXA 02 -500X350X180",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "152",
    "name": "CAIXA 03-800X210X60 PAPELÃO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "89",
    "name": "CAIXA 05 CADEIRA FORDOS C/ 10 UNIDADES",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "198",
    "name": "CANCELADO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "59",
    "name": "CANCELADO,,",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "293",
    "name": "CAVILHA 10 X 50MM (PACOTE COM 500 )",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "64",
    "name": "CHAPA DE ESPELHO 3MM AVILSA 2,20X3,210",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "194",
    "name": "CHAPA DE ESPELHO 3MM AVILSA 2,40X3,210",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "32",
    "name": "CHAPA MADEIRA BRANCA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "91",
    "name": "COLA DE MADEIRA GALÃO DE 5 KGS",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "294",
    "name": "COLA TECK BONDER",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "63",
    "name": "CONECTOR MAGUEIRA DE LED",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "223",
    "name": "CONPENSADO PARICA NAVEL 15",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "116",
    "name": "CORREDIÇA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "131",
    "name": "DOBRADIÇA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "243",
    "name": "ENCOSTO CADEIRA NOVA 0,40 X 0,20 X 0,05",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "233",
    "name": "ESA 10 NEW - M - 5 X 1,9 X 0,008 M MANTA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "231",
    "name": "ESA 12 NEW P 0,41 X 0,48 X 0,02 ENCOSTO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "232",
    "name": "ESA 14 NEW - P - 0,41 X 0,41 X 0,03 M ACENTO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "245",
    "name": "ESA 339 AD-P 0,4 X 0,2 X 0,05M",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "246",
    "name": "ESA CT21 F -P 0,406 X 0,383 X 0,05M",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "108",
    "name": "ESPELHO 4 MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "133",
    "name": "ESPELHO BRONZE",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "132",
    "name": "ESPELHO FUME",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "54",
    "name": "ESPELHO PRO INCOLOR 04MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "239",
    "name": "ESPUMA 0,41 X 0,418X 0,02",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "244",
    "name": "ESPUMA 0,41 X 0,41 X 0,03.",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "268",
    "name": "ESPUMA D18 BRANCA LB 0.8MM COM 5 MTS",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "124",
    "name": "ESPUMA D20 BRANCA L400 01 CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "125",
    "name": "ESPUMA D33 LARANJA L900 05 CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "76",
    "name": "EUCALUX PRETO FOSCO 3,6L",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "92",
    "name": "EUCATEX 1,21 X 2,12",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "93",
    "name": "EUCATEX 1,22 X 1,22",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "31",
    "name": "EUCATEX 3MM 2,33X0,50",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "327",
    "name": "EUCATEX BRANCO FOSCO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "112",
    "name": "FELTRO ADESIVO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "237",
    "name": "FEMIA DE SAPATA PARA MESA PÉ DE CEBOLA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "264",
    "name": "FERRO MECANICO 1/4-1,6",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "58",
    "name": "FITA ADESIVA AA40",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "272",
    "name": "FITA CREPE FINA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "273",
    "name": "FITA CREPE GROSSA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "181",
    "name": "FITA DE LED A PILHA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "184",
    "name": "FITA DE LED FRIO A PILHA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "109",
    "name": "FITA DUPLA FACE FINA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "99",
    "name": "FITA DUPLA FACE GROSSA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "4",
    "name": "FIXA ESPELHO BRANCO 400G",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "173",
    "name": "GRAMPO 80/14 15.670",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "208",
    "name": "GRAMPO ESTOFAMENTO 80.13 CX 15.750",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "202",
    "name": "GRAMPO ESTRUTUTAL 14/35 CX COM 14.400",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "115",
    "name": "GRAMPO GRAMPEADOR 80/14 C/8250PEÇAS",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "224",
    "name": "GRAMPO P/GRAMPEADOR 80/16 C-7500 PEÇAS",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "306",
    "name": "LAMPADA 15W",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "323",
    "name": "MADEIRA PINUS 10 X 4 X 3,0",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "123",
    "name": "MALHA DE EMBALAGEM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "240",
    "name": "MANTAS 0,008 FATIADAS",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "241",
    "name": "MANTAS FATIADAS COM 10 CM E 40 MANTAS FATIADAS COM 66 CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "303",
    "name": "MDF 12MM 275X244",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "30",
    "name": "MDF 12MM CRU 275X220 CORRETO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "144",
    "name": "MDF 15MM BRANCO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "154",
    "name": "MDF 2,8MM CRU 275X213",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "182",
    "name": "MDF BRANCO 18MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "321",
    "name": "MDF BRANCO OR 2F 09MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "213",
    "name": "MDF BRANCO OR 2F CORRETO 18MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "222",
    "name": "MDF CRU 06MM CORRETO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "94",
    "name": "MDF CRU 12MM 1,84X2,75",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "96",
    "name": "MDF CRU 12MM2,20X2,75",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "167",
    "name": "MDF CRU 18MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "178",
    "name": "MDF CRU 25MM 2,80X1,90",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "189",
    "name": "MDF CRU 25MM 2,80X2,20",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "155",
    "name": "MDF CRU 3MM CORRETO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "229",
    "name": "MDF CRU LIXADO 6,00X1850X2750",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "214",
    "name": "MDF PRETO 15MM 2F",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "121",
    "name": "MESA PÉ DE CEBOLA 35CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "215",
    "name": "MESA PÉ DE CEBOLA 40 CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "263",
    "name": "MESA PÉ DE CEBOLA 50 CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "219",
    "name": "MESA PE DE CEBOLA 60 CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "218",
    "name": "MESA PÉ DE CEBOLA 70CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "267",
    "name": "METALON 50X30XCH 18-8,95",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "134",
    "name": "MOLDURA DE ESPELHO PRATA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "135",
    "name": "MOLDURA DE ESPELHO PRETA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "114",
    "name": "PARAFUSO CHIP 3,5X16",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "196",
    "name": "PARAFUSO CHIP 5,0X40",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "65",
    "name": "PARAFUSO CHIP CHA 3,5X14",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "197",
    "name": "PARAFUSO P/ PUXADOR 4X18MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "280",
    "name": "PÉ DE CADEIRA FRENTE 44X4X3",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "216",
    "name": "PÉ DE CADEIRA TRASEIRO 52X4X3",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "291",
    "name": "PE DE CEBOLA 10CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "288",
    "name": "PEGADOR DE CADEIRA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "175",
    "name": "PELÍCULA BRANCA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "177",
    "name": "PELÍCULA DE MARMÓRE",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "176",
    "name": "PELÍCULA PRETA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "22",
    "name": "PERFIL(01) SIMPLES 45 X 17....",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "292",
    "name": "PERFIL TUB 61 X 54MM X 2MTS",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "221",
    "name": "PERFIL TUB C/ CORTE 5 X 22 X 2 MTS",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "220",
    "name": "PERFIL TUB C CORTE 10 X 22 X 2 PCT C/100",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "157",
    "name": "PINO DE 20MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "149",
    "name": "PINOS PINADORES 3,5",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "151",
    "name": "PINOS PINADORES 5",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "248",
    "name": "PINTURA PÉ DE CADEIRA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "156",
    "name": "PLACA DE ISOPOR GROSSA 2250X100X35MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "225",
    "name": "PLACA DE ISOPOR QUADRADINHO 2250 X 40 X 35MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "87",
    "name": "PLACAS DE ISOPOR",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "212",
    "name": "PLACAS DE ISOPOR FINA 2250 X 100 X12MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "136",
    "name": "PLASTICO FILME",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "137",
    "name": "PLASTICO FILME AMARELO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "249",
    "name": "POLTRONA OPALA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "316",
    "name": "PRETO FOSCO PU",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "281",
    "name": "PUXADOR 42X4X3",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "81",
    "name": "PUXADOR DE CRISTAL 30MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "161",
    "name": "PUXADOR DE CRISTAL 30MM DOURADO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "146",
    "name": "QUEROSENE EUCATEX 5 L",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "113",
    "name": "RODINHAS DE CABECEIRA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "180",
    "name": "ROLAMENTO DE MESA 94X94MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "80",
    "name": "ROLO DE LED C/ 100 METROS QUENTE 110V",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "163",
    "name": "ROLO DE LED C/ 100 METROS QUENTE 220V",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "162",
    "name": "ROLO DE LED FRIO C/ 100 METROS 110V",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "165",
    "name": "ROLO DE LED FRIO C/ 100 METROS 220V",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "299",
    "name": "SACO DE EMBALAGEM 15X20",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "324",
    "name": "SAPATA GRANDE 5/16 X 7/8",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "322",
    "name": "SAPATA ROSCA METÁLICA PEQUENA 1/4",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "186",
    "name": "SELADORA EUCATEX EXTRA 18L",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "169",
    "name": "SELADORA EXTRA 3,6LT EUCATEX 1GL",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "138",
    "name": "SILICONE ACETICO 260G PRETO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "139",
    "name": "SILICONE ACETICO 280ML WHURT",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "270",
    "name": "SILICONE BRONZE",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "271",
    "name": "SILICONE CINZA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "174",
    "name": "SILICONE INCOLOR WURTH",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "309",
    "name": "SOBRE TAMPO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "228",
    "name": "SUPORTE ESPELHO ORGANICO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "283",
    "name": "TAMPA DE MESA 1M",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "282",
    "name": "TAMPA DE MESA 90CM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "308",
    "name": "TAMPA PLASTICA 20X20",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "307",
    "name": "TAMPA PLASTICA 50X30",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "325",
    "name": "TAMPO DE METALON 50X20",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "122",
    "name": "TAMPO MESA PÉ DE CEBOLA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "255",
    "name": "TECIDO LINHA SATURNO 12 NATURAL",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "207",
    "name": "TECIDO LINHO SATURNO 07 GELO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "230",
    "name": "TECIDO LINHO SATURNO 13 TERRACOTA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "247",
    "name": "TECIDO MARFIM INCA CORTEX",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "295",
    "name": "TECIDO RATAN",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "210",
    "name": "TECIDO VELUDO INCA CASTOR",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "206",
    "name": "TECIDO VELUDO INCA PRETO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "211",
    "name": "TECIDO VELUDO INCA SALMÃO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "256",
    "name": "TECIDO VELUDO INCA VERDE",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "234",
    "name": "THINER ACABAMENTO 5 L EUCATEX 9800",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "296",
    "name": "THINNER ACABAMENTO 9800 18L",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "170",
    "name": "THINNER LIMPEZA 5LT EUCATEX 9100 1GL",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "300",
    "name": "TINTA DOURADA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "326",
    "name": "TINTA PRATA",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "128",
    "name": "TNT 40/1,40 PRETO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "266",
    "name": "T UBO 3/4 X CH 20 - 2,56",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "265",
    "name": "T UBO 5/8 X CH20-2,15",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('estoque');
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('Todos');
  const [filterClassification, setFilterClassification] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formName, setFormName] = useState('');
  const [formSector, setFormSector] = useState('SUBLIMAÇÃO');
  const [formClassification, setFormClassification] = useState('Matéria Prima');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formInitialStock, setFormInitialStock] = useState('0');

  const [moveType, setMoveType] = useState('Entrada');
  const [moveProductId, setMoveProductId] = useState('');
  const [moveQty, setMoveQty] = useState('1');
  const [moveEmployee, setMoveEmployee] = useState(EMPLOYEES_LIST[0]);
  const [moveNote, setMoveNote] = useState('');

  useEffect(() => {
    signInAnonymously(auth).catch((error) => console.error("Erro Auth:", error));
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const prodRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    
    // Força a atualização/inserção de todos os 320 produtos independentemente do estado anterior
    getDocs(prodRef).then(async (snapshot) => {
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach((p, idx) => {
        const pId = 'prod_import_' + idx;
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', pId);
        batch.set(docRef, {
          name: p.name,
          sector: p.sector,
          classification: p.classification,
          minStock: p.minStock,
          stock: p.stock,
          code: p.code,
          unit: p.unit,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
    }).catch(err => console.error("Erro ao popular produtos:", err));

    const unsubProd = onSnapshot(prodRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
      if (list.length > 0 && !moveProductId) setMoveProductId(list[0].id);
    });

    const unsubMov = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'movements'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMovements(list.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setLoading(false);
    });

    return () => {
      unsubProd();
      unsubMov();
    };
  }, [user]);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const productId = editingProduct ? editingProduct.id : 'prod_' + Date.now();
    const productData = {
      name: formName.trim(),
      sector: formSector,
      classification: formClassification,
      minStock: Number(formMinStock) || 0,
      stock: editingProduct ? editingProduct.stock : (Number(formInitialStock) || 0),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId), productData);
      
      if (!editingProduct && Number(formInitialStock) > 0) {
        const movId = 'mov_' + Date.now();
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'movements', movId), {
          productId,
          productName: formName.trim(),
          sector: formSector,
          classification: formClassification,
          type: 'Entrada',
          qty: Number(formInitialStock),
          employee: '-',
          note: 'Estoque Inicial de Cadastro',
          date: new Date().toISOString()
        });
      }

      closeModal();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      alert("Erro ao salvar produto na nuvem.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormName('');
    setFormMinStock('5');
    setFormInitialStock('0');
    setFormClassification('Matéria Prima');
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormSector(prod.sector);
    setFormClassification(prod.classification || 'Matéria Prima');
    setFormMinStock(prod.minStock);
    setFormInitialStock(prod.stock);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
      } catch (err) {
        console.error("Erro ao excluir:", err);
      }
    }
  };

  const handleUpdateField = async (prod, field, value) => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', prod.id), {
        ...prod,
        [field]: value,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Erro ao atualizar campo:", err);
    }
  };

  const handleSaveMovement = async (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === moveProductId);
    if (!product) {
      alert("Selecione um produto válido.");
      return;
    }

    const qtyNum = product.sector === 'EPI' ? 1 : Number(moveQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      alert("Quantidade inválida.");
      return;
    }

    if (moveType === 'Saída' && product.stock < qtyNum) {
      alert(`Estoque insuficiente! Estoque atual: ${product.stock}`);
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
        productName: product.name,
        sector: product.sector,
        classification: product.classification || 'Matéria Prima',
        type: moveType,
        qty: qtyNum,
        employee: product.sector === 'EPI' ? moveEmployee : '-',
        note: moveNote.trim() || '-',
        date: new Date().toISOString()
      });

      await batch.commit();
      setIsMoveModalOpen(false);
      setMoveNote('');
      setMoveQty('1');
    } catch (err) {
      console.error("Erro ao registrar movimentação:", err);
      alert("Erro ao salvar movimentação.");
    }
  };

  const handleDeleteMovement = async (mov) => {
    if (!confirm("Deseja estornar e apagar esta movimentação?")) return;
    try {
      const product = products.find(p => p.id === mov.productId);
      const batch = writeBatch(db);

      if (product) {
        const restoredStock = mov.type === 'Entrada' ? product.stock - mov.qty : product.stock + mov.qty;
        const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', product.id);
        batch.update(prodRef, { stock: restoredStock });
      }

      const movRef = doc(db, 'artifacts', appId, 'public', 'data', 'movements', mov.id);
      batch.delete(movRef);

      await batch.commit();
    } catch (err) {
      console.error("Erro ao excluir movimento:", err);
    }
  };

  const exportCSV = () => {
    let csvContent = "\uFEFF";
    csvContent += "=== RELAÇÃO DE ENTRADAS DE PRODUTOS ===\n";
    csvContent += "Data/Hora;Produto;Setor;Classificação;Quantidade;Funcionário;Observação\n";
    
    const entradas = movements.filter(m => m.type === 'Entrada');
    entradas.forEach(m => {
      const dateStr = new Date(m.date).toLocaleString('pt-BR');
      csvContent += `"${dateStr}";"${m.productName}";"${m.sector}";"${m.classification || 'Matéria Prima'}";${m.qty};"${m.employee}";"${m.note}"\n`;
    });
    const totalEntradas = entradas.reduce((acc, m) => acc + m.qty, 0);
    csvContent += `SUBTOTAL ENTRADAS;;;;${totalEntradas};;\n\n`;

    csvContent += "=== RELAÇÃO DE SAÍDAS DE PRODUTOS ===\n";
    csvContent += "Data/Hora;Produto;Setor;Classificação;Quantidade;Funcionário;Observação\n";
    
    const saidas = movements.filter(m => m.type === 'Saída');
    saidas.forEach(m => {
      const dateStr = new Date(m.date).toLocaleString('pt-BR');
      csvContent += `"${dateStr}";"${m.productName}";"${m.sector}";"${m.classification || 'Matéria Prima'}";${m.qty};"${m.employee}";"${m.note}"\n`;
    });
    const totalSaidas = saidas.reduce((acc, m) => acc + m.qty, 0);
    csvContent += `SUBTOTAL SAÍDAS;;;;${totalSaidas};;\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_personaliza_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(p => {
    const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSector = filterSector === 'Todos' || p.sector === filterSector;
    const matchClass = filterClassification === 'Todas' || (p.classification || 'Matéria Prima') === filterClassification;
    return matchName && matchSector && matchClass;
  });

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2D1B12] text-[#FDFBF7] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl tracking-wide font-medium text-[#C5A880]">Personaliza - A carregar 320 Produtos da Nuvem...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D1B12] font-sans flex flex-col">
      <header className="bg-[#2D1B12] text-[#FDFBF7] border-b border-[#C5A880]/30 shadow-lg px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-[#FDFBF7]">PERSONALIZA</h1>
            <p className="text-xs text-[#C5A880] tracking-widest uppercase">Sistema Executivo de Gestão de Estoque</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 bg-[#1F120B] p-1.5 rounded-xl border border-[#C5A880]/20">
          <button 
            onClick={() => setActiveTab('estoque')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'estoque' ? 'bg-[#C5A880] text-[#2D1B12] shadow' : 'text-[#FDFBF7]/80 hover:text-white hover:bg-white/5'}`}
          >
            Estoque por Setor ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab('movimentacao')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'movimentacao' ? 'bg-[#C5A880] text-[#2D1B12] shadow' : 'text-[#FDFBF7]/80 hover:text-white hover:bg-white/5'}`}
          >
            Movimentação
          </button>
          <button 
            onClick={() => setActiveTab('resumo')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'resumo' ? 'bg-[#C5A880] text-[#2D1B12] shadow' : 'text-[#FDFBF7]/80 hover:text-white hover:bg-white/5'}`}
          >
            Resumo e Relatórios {lowStockCount > 0 && `(${lowStockCount})`}
          </button>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'estoque' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#C5A880]/20">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder="Pesquisar produto..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 px-4 py-2 bg-[#FDFBF7] border border-[#C5A880]/30 rounded-xl text-sm focus:outline-none"
                />
                <select 
                  value={filterSector} 
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="py-2 px-3 bg-[#FDFBF7] border border-[#C5A880]/30 rounded-xl text-sm"
                >
                  <option value="Todos">Todos os Setores</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select 
                  value={filterClassification} 
                  onChange={(e) => setFilterClassification(e.target.value)}
                  className="py-2 px-3 bg-[#FDFBF7] border border-[#C5A880]/30 rounded-xl text-sm"
                >
                  <option value="Todas">Todas Classificações</option>
                  <option value="Matéria Prima">Matéria Prima</option>
                  <option value="Consumo">Consumo</option>
                </select>
              </div>

              <button 
                onClick={() => { setEditingProduct(null); setFormName(''); setFormMinStock('5'); setFormInitialStock('0'); setIsModalOpen(true); }}
                className="bg-[#2D1B12] text-[#FDFBF7] px-5 py-2.5 rounded-xl font-semibold hover:bg-[#3D261A] transition shadow"
              >
                + Novo Produto
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#C5A880]/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#2D1B12]/5 text-[#2D1B12] border-b border-[#C5A880]/20 text-xs uppercase tracking-wider font-bold">
                      <th className="p-4">Cód.</th>
                      <th className="p-4">Produto</th>
                      <th className="p-4">Setor</th>
                      <th className="p-4">Classificação</th>
                      <th className="p-4 text-center">Estoque Atual</th>
                      <th className="p-4 text-center">Est. Mínimo</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-gray-400">Nenhum produto encontrado.</td>
                      </tr>
                    ) : (
                      filteredProducts.map(prod => {
                        const isLow = prod.stock <= prod.minStock;
                        return (
                          <tr key={prod.id} className="hover:bg-[#FDFBF7]/60 transition">
                            <td className="p-4 text-xs font-bold text-gray-500">{prod.code || '-'}</td>
                            <td className="p-4 font-semibold text-[#2D1B12]">{prod.name}</td>
                            <td className="p-4">
                              <span className="bg-[#C5A880]/15 text-[#2D1B12] px-2.5 py-1 rounded-lg text-xs font-semibold">
                                {prod.sector}
                              </span>
                            </td>
                            <td className="p-4">
                              <select 
                                value={prod.classification || 'Matéria Prima'} 
                                onChange={(e) => handleUpdateField(prod, 'classification', e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
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
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => openEditProduct(prod)} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold">Editar</button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">Excluir</button>
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

        {activeTab === 'movimentacao' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#C5A880]/20">
              <div>
                <h2 className="text-lg font-bold text-[#2D1B12]">Controle de Entradas e Saídas</h2>
                <p className="text-xs text-gray-500">Registe lançamentos de novos materiais ou retiradas.</p>
              </div>
              <button 
                onClick={() => { setMoveType('Entrada'); setIsMoveModalOpen(true); }}
                className="bg-[#2D1B12] text-[#FDFBF7] px-5 py-2.5 rounded-xl font-semibold hover:bg-[#3D261A] transition shadow"
              >
                + Nova Movimentação
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#C5A880]/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#2D1B12]/5 text-[#2D1B12] border-b border-[#C5A880]/20 text-xs uppercase tracking-wider font-bold">
                      <th className="p-4">Data / Hora</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Produto</th>
                      <th className="p-4">Setor</th>
                      <th className="p-4">Classificação</th>
                      <th className="p-4 text-center">Qtd</th>
                      <th className="p-4">Funcionário (EPI)</th>
                      <th className="p-4">Observação</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="p-8 text-center text-gray-400">Nenhuma movimentação registada.</td>
                      </tr>
                    ) : (
                      movements.map(mov => (
                        <tr key={mov.id} className="hover:bg-[#FDFBF7]/60 transition">
                          <td className="p-4 text-xs text-gray-500">{new Date(mov.date).toLocaleString('pt-BR')}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${mov.type === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {mov.type}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-[#2D1B12]">{mov.productName}</td>
                          <td className="p-4 text-xs font-medium text-gray-600">{mov.sector}</td>
                          <td className="p-4 text-xs text-gray-600">{mov.classification || 'Matéria Prima'}</td>
                          <td className="p-4 text-center font-bold text-base">{mov.qty}</td>
                          <td className="p-4 text-xs font-medium text-gray-700">{mov.employee}</td>
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

        {activeTab === 'resumo' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#C5A880]/20">
              <div>
                <h2 className="text-xl font-bold text-[#2D1B12]">Resumo Executivo e Relatórios</h2>
                <p className="text-xs text-gray-500">Relatório organizado com separação clara de Entradas e Saídas.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={exportCSV} 
                  className="bg-[#C5A880] text-[#2D1B12] px-4 py-2.5 rounded-xl font-semibold hover:bg-[#B3976F] transition shadow text-sm"
                >
                  Baixar Planilha Excel (.CSV)
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="bg-[#2D1B12] text-[#FDFBF7] px-4 py-2.5 rounded-xl font-semibold hover:bg-[#3D261A] transition shadow text-sm"
                >
                  Imprimir / Salvar PDF
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C5A880]/20 space-y-4">
              <h3 className="text-lg font-bold text-[#2D1B12] border-b pb-2">1. Relação de Entradas de Produtos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-xs uppercase font-bold">
                      <th className="p-3">Data</th>
                      <th className="p-3">Produto</th>
                      <th className="p-3">Setor</th>
                      <th className="p-3">Classificação</th>
                      <th className="p-3 text-center">Quantidade</th>
                      <th className="p-3">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movements.filter(m => m.type === 'Entrada').length === 0 ? (
                      <tr><td colSpan="6" className="p-4 text-center text-gray-400">Nenhuma entrada registada.</td></tr>
                    ) : (
                      movements.filter(m => m.type === 'Entrada').map(m => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="p-3 text-xs text-gray-500">{new Date(m.date).toLocaleString('pt-BR')}</td>
                          <td className="p-3 font-semibold">{m.productName}</td>
                          <td className="p-3 text-xs">{m.sector}</td>
                          <td className="p-3 text-xs">{m.classification || 'Matéria Prima'}</td>
                          <td className="p-3 text-center font-bold text-green-700">+{m.qty}</td>
                          <td className="p-3 text-xs text-gray-500">{m.note}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="text-right font-bold text-sm text-gray-700 pt-2">
                Subtotal Entradas: <span className="text-green-700">{movements.filter(m => m.type === 'Entrada').reduce((acc, m) => acc + m.qty, 0)} unidades</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C5A880]/20 space-y-4">
              <h3 className="text-lg font-bold text-[#2D1B12] border-b pb-2">2. Relação de Saídas de Produtos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-xs uppercase font-bold">
                      <th className="p-3">Data</th>
                      <th className="p-3">Produto</th>
                      <th className="p-3">Setor</th>
                      <th className="p-3">Classificação</th>
                      <th className="p-3 text-center">Quantidade</th>
                      <th className="p-3">Funcionário / EPI</th>
                      <th className="p-3">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movements.filter(m => m.type === 'Saída').length === 0 ? (
                      <tr><td colSpan="7" className="p-4 text-center text-gray-400">Nenhuma saída registada.</td></tr>
                    ) : (
                      movements.filter(m => m.type === 'Saída').map(m => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="p-3 text-xs text-gray-500">{new Date(m.date).toLocaleString('pt-BR')}</td>
                          <td className="p-3 font-semibold">{m.productName}</td>
                          <td className="p-3 text-xs">{m.sector}</td>
                          <td className="p-3 text-xs">{m.classification || 'Matéria Prima'}</td>
                          <td className="p-3 text-center font-bold text-orange-700">-{m.qty}</td>
                          <td className="p-3 text-xs font-medium">{m.employee}</td>
                          <td className="p-3 text-xs text-gray-500">{m.note}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="text-right font-bold text-sm text-gray-700 pt-2">
                Subtotal Saídas: <span className="text-orange-700">{movements.filter(m => m.type === 'Saída').reduce((acc, m) => acc + m.qty, 0)} unidades</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-lg font-bold text-[#2D1B12]">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 font-bold">X</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome do Produto</label>
                <input 
                  type="text" 
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Chapa MDF 15mm"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Setor</label>
                  <select 
                    value={formSector}
                    onChange={(e) => setFormSector(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  >
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Classificação</label>
                  <select 
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="Matéria Prima">Matéria Prima</option>
                    <option value="Consumo">Consumo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estoque Mínimo</label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                {!editingProduct && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estoque Inicial</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      value={formInitialStock}
                      onChange={(e) => setFormInitialStock(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#2D1B12] text-[#FDFBF7] text-sm font-semibold shadow">
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-lg font-bold text-[#2D1B12]">Registar Movimentação</h3>
              <button onClick={() => setIsMoveModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold">X</button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo</label>
                  <select 
                    value={moveType}
                    onChange={(e) => setMoveType(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="Entrada">Entrada (Adicionar)</option>
                    <option value="Saída">Saída (Retirar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantidade</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    disabled={products.find(p => p.id === moveProductId)?.sector === 'EPI'}
                    value={products.find(p => p.id === moveProductId)?.sector === 'EPI' ? 1 : moveQty}
                    onChange={(e) => setMoveQty(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Produto</label>
                <select 
                  value={moveProductId}
                  onChange={(e) => setMoveProductId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code ? `[${p.code}] ` : ''}{p.name} ({p.sector}) - Disp: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              {products.find(p => p.id === moveProductId)?.sector === 'EPI' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Funcionário (EPI)</label>
                  <select 
                    value={moveEmployee}
                    onChange={(e) => setMoveEmployee(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    {EMPLOYEES_LIST.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Observação (Opcional)</label>
                <input 
                  type="text" 
                  value={moveNote}
                  onChange={(e) => setMoveNote(e.target.value)}
                  placeholder="Ex: Fornecedor X ou motivo da retirada"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsMoveModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#2D1B12] text-[#FDFBF7] text-sm font-semibold shadow">
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
