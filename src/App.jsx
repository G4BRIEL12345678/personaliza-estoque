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
const appId = "personaliza-estoque-v1";

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
    "code": "87",
    "name": "TECIDO SLUPPA",
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
    "code": "48",
    "name": "TINTA MAGENTA 1 L TS-100",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 5.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "49",
    "name": "TINTA PRETO 1 LITRO TS-100",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "50",
    "name": "TINTA YELLOW 1 LITRO TS-100",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "91",
    "name": "TONER 135A PRETO",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "108",
    "name": "VASO CILINDRICO G",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "109",
    "name": "VASO CILINDRICO M",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "110",
    "name": "VASO CILINDRICO P",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "111",
    "name": "VASO CUBO G",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "112",
    "name": "VASO CUBO M",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "113",
    "name": "VASO CUBO P",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "114",
    "name": "VASO LAGOON G",
    "sector": "SUBLIMAÇÃO",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "115",
    "name": "VASO LAGOON M",
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
    "code": "304",
    "name": "APARADOR CANTO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "151",
    "name": "CAIXA DE PAPELAO 100X35X10",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "152",
    "name": "CAIXA DE PAPELAO 100X60X10",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "136",
    "name": "CAIXA DE PAPELAO 112X55X15",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "153",
    "name": "CAIXA DE PAPELAO 125X65X15",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "154",
    "name": "CAIXA DE PAPELAO 140X55X15",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "155",
    "name": "CAIXA DE PAPELAO 150X70X15",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "156",
    "name": "CAIXA DE PAPELAO 165X75X15",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "157",
    "name": "CAIXA DE PAPELAO 180X80X15",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "137",
    "name": "CAIXA DE PAPELAO 75X45X15",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "138",
    "name": "CAIXA DE PAPELAO 90X50X15",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "139",
    "name": "CANTONEIRA DE PAPELÃO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "140",
    "name": "CHAPA DE MDF 15 MM BRANCO TX 2 FACES",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "161",
    "name": "CHAPA DE MDF 15MM AMENDOA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "162",
    "name": "CHAPA DE MDF 15MM CEREJEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "163",
    "name": "CHAPA DE MDF 15MM CINZA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "164",
    "name": "CHAPA DE MDF 15MM IMBUIA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "165",
    "name": "CHAPA DE MDF 15MM NOGUEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "166",
    "name": "CHAPA DE MDF 15MM PRETO TX",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "167",
    "name": "CHAPA DE MDF 15MM RUSTIC",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "168",
    "name": "CHAPA DE MDF 15MM TCO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "169",
    "name": "CHAPA DE MDF 18MM AMENDOA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "170",
    "name": "CHAPA DE MDF 18MM BRANCO TX 2 FACES",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "171",
    "name": "CHAPA DE MDF 18MM CEREJEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "172",
    "name": "CHAPA DE MDF 18MM CINZA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "173",
    "name": "CHAPA DE MDF 18MM IMBUIA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "174",
    "name": "CHAPA DE MDF 18MM NOGUEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "175",
    "name": "CHAPA DE MDF 18MM PRETO TX",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "176",
    "name": "CHAPA DE MDF 18MM RUSTIC",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "177",
    "name": "CHAPA DE MDF 18MM TCO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "178",
    "name": "CHAPA DE MDF 3MM AMENDOA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "179",
    "name": "CHAPA DE MDF 3MM BRANCO TX 2 FACES",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "180",
    "name": "CHAPA DE MDF 3MM CEREJEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "181",
    "name": "CHAPA DE MDF 3MM CINZA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "182",
    "name": "CHAPA DE MDF 3MM IMBUIA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "183",
    "name": "CHAPA DE MDF 3MM NOGUEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "184",
    "name": "CHAPA DE MDF 3MM PRETO TX",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "185",
    "name": "CHAPA DE MDF 3MM RUSTIC",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "186",
    "name": "CHAPA DE MDF 3MM TCO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "187",
    "name": "CHAPA DE MDF 6MM AMENDOA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "188",
    "name": "CHAPA DE MDF 6MM BRANCO TX 2 FACES",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "189",
    "name": "CHAPA DE MDF 6MM CEREJEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "190",
    "name": "CHAPA DE MDF 6MM CINZA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "191",
    "name": "CHAPA DE MDF 6MM IMBUIA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "192",
    "name": "CHAPA DE MDF 6MM NOGUEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "193",
    "name": "CHAPA DE MDF 6MM PRETO TX",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "194",
    "name": "CHAPA DE MDF 6MM RUSTIC",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "195",
    "name": "CHAPA DE MDF 6MM TCO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "196",
    "name": "CHAPA DE MDF 9MM AMENDOA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "197",
    "name": "CHAPA DE MDF 9MM BRANCO TX 2 FACES",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "198",
    "name": "CHAPA DE MDF 9MM CEREJEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "199",
    "name": "CHAPA DE MDF 9MM CINZA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "200",
    "name": "CHAPA DE MDF 9MM IMBUIA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "202",
    "name": "CHAPA DE MDF 9MM NOGUEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "203",
    "name": "CHAPA DE MDF 9MM PRETO TX",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "204",
    "name": "CHAPA DE MDF 9MM RUSTIC",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "205",
    "name": "CHAPA DE MDF 9MM TCO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "206",
    "name": "COLA BICOMPONENTE EXTRA FORTE 1KG",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "207",
    "name": "COLA BRANCA PVA EXTRA 1KG",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "208",
    "name": "COLA DE CONTATO SOLVENTE 2,8L",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "209",
    "name": "COLA HOT MELT PARA BORDA 1KG",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "210",
    "name": "CORREDIÇA TELESCOPICA 30CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "211",
    "name": "CORREDIÇA TELESCOPICA 35CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "212",
    "name": "CORREDIÇA TELESCOPICA 40CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "213",
    "name": "CORREDIÇA TELESCOPICA 45CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "214",
    "name": "CORREDIÇA TELESCOPICA 50CM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "215",
    "name": "DOBRADIÇA CANECO 35MM 35 GRAUS",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "216",
    "name": "DOBRADIÇA CANECO 35MM COM AMORTECEDOR",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "217",
    "name": "DOBRADIÇA CANECO 35MM RETA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "218",
    "name": "ENCOSTO ESTOFADO MODULAR",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "219",
    "name": "ESTROBO FIXADOR DE PAREDE",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "220",
    "name": "FECHADURA PARA GAVETA 20MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "221",
    "name": "FITA DE BORDA PVC 19MM AMENDOA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "222",
    "name": "FITA DE BORDA PVC 19MM BRANCA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "223",
    "name": "FITA DE BORDA PVC 19MM CEREJEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "224",
    "name": "FITA DE BORDA PVC 19MM CINZA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "225",
    "name": "FITA DE BORDA PVC 19MM IMBUIA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "226",
    "name": "FITA DE BORDA PVC 19MM NOGUEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "227",
    "name": "FITA DE BORDA PVC 19MM PRETA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "228",
    "name": "FITA DE BORDA PVC 19MM RUSTIC",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "229",
    "name": "FITA DE BORDA PVC 19MM TCO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "230",
    "name": "FITA DE BORDA PVC 35MM AMENDOA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "231",
    "name": "FITA DE BORDA PVC 35MM BRANCA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "232",
    "name": "FITA DE BORDA PVC 35MM CEREJEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "233",
    "name": "FITA DE BORDA PVC 35MM CINZA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "234",
    "name": "FITA DE BORDA PVC 35MM IMBUIA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "235",
    "name": "FITA DE BORDA PVC 35MM NOGUEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "236",
    "name": "FITA DE BORDA PVC 35MM PRETA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "237",
    "name": "FITA DE BORDA PVC 35MM RUSTIC",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "238",
    "name": "FITA DE BORDA PVC 35MM TCO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "239",
    "name": "KIT INFRAESTRUTURA PARA PRATELEIRA INVISIVEL",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "240",
    "name": "MASSA PARA CORRETIVA DE MDF 100G",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "241",
    "name": "PARAFUSO CHIPBOARD 3.5X35",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "242",
    "name": "PARAFUSO CHIPBOARD 4.0X40",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "243",
    "name": "PARAFUSO CHIPBOARD 4.5X50",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "244",
    "name": "PERFIL DE ALUMINIO PULL P/ PORTAS",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "245",
    "name": "PUXADOR CONCHA PRETO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "246",
    "name": "PUXADOR PONTO METALICO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "247",
    "name": "SILICONE ACETICO INCOLOR 280G",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "248",
    "name": "SUPORTE MAO FRANCESA 20X20",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "249",
    "name": "SUPORTE MAO FRANCESA 30X30",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "250",
    "name": "SUPORTE TOALHEIRO CROMADO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "251",
    "name": "TAPETE DE SISAL SINTETICO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "252",
    "name": "TUBO CABIDEIRO OVAL CROMADO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "253",
    "name": "SUPORTE PARA TUBO CABIDEIRO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "254",
    "name": "GANCHO PORTA CHAVES",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "255",
    "name": "CANTONEIRA METALICA 90 GRAUS",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "256",
    "name": "BUCHA S8 COM PARAFUSO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "257",
    "name": "BUCHA S10 COM PARAFUSO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "258",
    "name": "RODIZIO DE GEL COM TRAVA 50MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "259",
    "name": "RODIZIO DE GEL SEM TRAVA 50MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "260",
    "name": "PASSA FIO PLASTICO PARA MESA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "261",
    "name": "MINIFIX COMPLETO TAMANHO 15MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "262",
    "name": "TAMBOR MINIFIX 15MM",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "263",
    "name": "HASTE PARA MINIFIX",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "264",
    "name": "CAVILHA DE MADEIRA 6X30",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "265",
    "name": "CAVILHA DE MADEIRA 8X30",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "266",
    "name": "TAPA FURO ADESIVO AMENDOA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "267",
    "name": "TAPA FURO ADESIVO BRANCO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "268",
    "name": "TAPA FURO ADESIVO CEREJEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "269",
    "name": "TAPA FURO ADESIVO CINZA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "270",
    "name": "TAPA FURO ADESIVO IMBUIA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "271",
    "name": "TAPA FURO ADESIVO NOGUEIRA",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "272",
    "name": "TAPA FURO ADESIVO PRETO",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "273",
    "name": "TAPA FURO ADESIVO RUSTIC",
    "sector": "MARCENARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "274",
    "name": "TAPA FURO ADESIVO TCO",
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
    "code": "275",
    "name": "BASCULA DE VIDRO TEMPERADO 8MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "276",
    "name": "BLINDEX KIT 1 PARA BOX DE CORRER",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "277",
    "name": "BLINDEX KIT 2 PARA BOX DE CORRER",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "278",
    "name": "BOTÃO JOCKEY PARA ESPELHO 5/8",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "279",
    "name": "CALÇO DE PVC PARA VIDRO 2MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "280",
    "name": "CALÇO DE PVC PARA VIDRO 5MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "281",
    "name": "CHAPA DE VIDRO LAMINADO 4+4 INCOLOR",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "282",
    "name": "CHAPA DE VIDRO LAMINADO 6+6 FUME",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "283",
    "name": "CHAPA DE VIDRO TEMPERADO 10MM BRONZE",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "284",
    "name": "CHAPA DE VIDRO TEMPERADO 10MM FUME",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "285",
    "name": "CHAPA DE VIDRO TEMPERADO 10MM INCOLOR",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "286",
    "name": "CHAPA DE VIDRO TEMPERADO 8MM BRONZE",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "287",
    "name": "CHAPA DE VIDRO TEMPERADO 8MM FUME",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "288",
    "name": "CHAPA DE VIDRO TEMPERADO 8MM INCOLOR",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "289",
    "name": "FECHADURA PARA PORTA DE VIDRO 1520",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "290",
    "name": "GAXETA DE BORRACHA P/ VIDRO 10MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "291",
    "name": "GAXETA DE BORRACHA P/ VIDRO 8MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "292",
    "name": "KIT ENGENHARIA PARA PORTA DE VIDRO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "293",
    "name": "PERFIL U DE ALUMINIO PARA VIDRO 10MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "294",
    "name": "PERFIL U DE ALUMINIO PARA VIDRO 8MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "295",
    "name": "VENTOSA DUPLA PARA TRANSPORTE DE VIDRO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "296",
    "name": "VENTOSA SIMPLES PARA VIDRO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "297",
    "name": "SUPORTE PINO PARA PRATELEIRA DE VIDRO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "298",
    "name": "CHAVE ALLEN 3MM PARA FERRAGEM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "299",
    "name": "CHAVE ALLEN 4MM PARA FERRAGEM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "300",
    "name": "DISCO DE CORTE DIAMANTADO 110MM",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "301",
    "name": "TALHADEIRA PARA VIDRO",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "302",
    "name": "MARTELO DE BORRACHA 400G",
    "sector": "VIDRAÇARIA",
    "unit": "UN",
    "stock": 0.0,
    "minStock": 5,
    "classification": "Matéria Prima"
  },
  {
    "code": "303",
    "name": "TRENA DE FIBRA 5 METROS",
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
    
    getDocs(prodRef).then(async (snapshot) => {
      if (snapshot.empty) {
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
          });
        });
        await batch.commit();
      }
    }).catch(err => console.error("Erro ao verificar/popular produtos:", err));

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
