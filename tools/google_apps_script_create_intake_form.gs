/**
 * Strange Works Studio intake form builder.
 *
 * Run this from https://script.google.com while logged in as the operator
 * account that owns the Google Sheet ledger. It creates the Google Form,
 * links responses to the existing Sheet, and writes the public/edit URLs back
 * to the Sheet for private operator evidence.
 *
 * Do not paste the edit URL into public-config.js. Use only the published
 * responder URL after a safe test response lands in the response Sheet.
 */
const CONFIG = {
  spreadsheetId: "PASTE_SPREADSHEET_ID_HERE",
  formTitle: "Strange Works Studio Intake",
  responseSheetName: "Responses",
  repoConfigSheetName: "Repo Config",
  verificationSheetName: "Verification",
  supportEmail: "tuiidagnese+strangeworks@gmail.com",
  description:
    "Solicite uma avaliacao operacional da Strange Works Studio. Nao envie senhas, tokens, CPF, cartao, dados financeiros sensiveis, dados de saude ou arquivos confidenciais neste formulario. Se o pedido exigir dados sensiveis, marque isso no campo apropriado para combinarmos uma rota mais segura. Ao enviar, voce concorda com o uso dos dados para contato, triagem e preparacao de proposta.",
  confirmationMessage:
    "Recebemos seu pedido. Vamos revisar e responder pelo email informado. Nao envie senhas, tokens, CPF, cartao ou dados confidenciais por email sem combinarmos uma rota segura."
};

function createStrangeWorksIntakeForm() {
  if (!CONFIG.spreadsheetId || CONFIG.spreadsheetId === "PASTE_SPREADSHEET_ID_HERE") {
    throw new Error("Set CONFIG.spreadsheetId before running.");
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const beforeSheetIds = spreadsheet.getSheets().map((sheet) => sheet.getSheetId());
  const form = FormApp.create(CONFIG.formTitle)
    .setTitle(CONFIG.formTitle)
    .setDescription(CONFIG.description)
    .setConfirmationMessage(CONFIG.confirmationMessage)
    .setAllowResponseEdits(false)
    .setCollectEmail(false)
    .setLimitOneResponsePerUser(false)
    .setPublishingSummary(false)
    .setShowLinkToRespondAgain(false);

  form.setDestination(FormApp.DestinationType.SPREADSHEET, CONFIG.spreadsheetId);

  addItems_(form);
  normalizeResponseSheet_(spreadsheet, beforeSheetIds);
  writeFormEvidence_(spreadsheet, form);

  Logger.log("Published responder URL: " + form.getPublishedUrl());
  Logger.log("Edit URL: " + form.getEditUrl());

  return {
    formId: form.getId(),
    publishedUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
    destinationId: form.getDestinationId()
  };
}

function addItems_(form) {
  addCheckbox_(form, {
    title: "Autorizo a Strange Works Studio a usar estes dados para responder ao meu pedido e preparar proposta operacional.",
    required: true,
    choices: ["Li e aceito o uso dos dados para contato e proposta."]
  });

  addText_(form, {
    title: "Nome do contato",
    required: true
  });

  addEmail_(form, {
    title: "Email de trabalho",
    required: true
  });

  addText_(form, {
    title: "Empresa, estudio ou projeto",
    required: true
  });

  addText_(form, {
    title: "Onde voce opera principalmente?",
    helpText: "Pais / estado / cidade, opcional. Nao informe endereco residencial.",
    required: false
  });

  addMultipleChoice_(form, {
    title: "Qual servico voce quer avaliar?",
    required: true,
    choices: [
      "Operational website / analytics",
      "Support or inbox workflow",
      "AI workflow",
      "Localization / PT-BR",
      "Compliance readiness",
      "Other"
    ]
  });

  addMultipleChoice_(form, {
    title: "Pacote provavel",
    required: true,
    choices: [
      "Pilot Sprint - R$750",
      "Maintenance - R$79/month",
      "Custom scope",
      "Not sure"
    ]
  });

  addMultipleChoice_(form, {
    title: "Urgencia",
    required: true,
    choices: [
      "This week",
      "This month",
      "Exploring",
      "Emergency / broken workflow"
    ]
  });

  addMultipleChoice_(form, {
    title: "Faixa de orcamento em BRL",
    required: false,
    choices: [
      "Under R$750",
      "R$750-R$1,500",
      "R$1,500-R$5,000",
      "Above R$5,000",
      "Not sure"
    ]
  });

  addParagraph_(form, {
    title: "Link do site, app, jogo, loja ou repositorio publico",
    helpText: "Links publicos apenas. Nao envie tokens, senhas ou arquivos confidenciais.",
    required: false
  });

  addParagraph_(form, {
    title: "Quais ferramentas voce usa hoje?",
    helpText: "Exemplos: GitHub, Gmail, Google Sheets, Shopify, Discord.",
    required: false
  });

  addParagraph_(form, {
    title: "Qual problema voce quer resolver primeiro?",
    helpText: "Descreva o problema de negocio sem incluir dados sensiveis.",
    required: true
  });

  addParagraph_(form, {
    title: "Como vamos saber que deu certo?",
    helpText: "Escreva o resultado esperado de forma mensuravel.",
    required: true
  });

  addMultipleChoice_(form, {
    title: "Voce precisa enviar dados pessoais, financeiros ou confidenciais para avaliarmos?",
    required: true,
    choices: [
      "No",
      "Maybe, but not in this form",
      "Yes, and I need a safer route first"
    ]
  });

  addMultipleChoice_(form, {
    title: "Precisa de NDA, DPA ou contrato especifico antes de detalhes?",
    required: false,
    choices: ["No", "NDA", "DPA/LGPD", "Other / not sure"]
  });

  addMultipleChoice_(form, {
    title: "Para proposta/nota fiscal, voce compra como pessoa fisica ou empresa?",
    helpText: "Nao informe CPF ou CNPJ neste formulario publico.",
    required: false,
    choices: ["Company", "Individual", "Not sure"]
  });

  addMultipleChoice_(form, {
    title: "Canal preferido para retorno",
    required: true,
    choices: [
      "Email",
      "Google Meet",
      "Discord",
      "WhatsApp only after email confirmation"
    ]
  });

  addParagraph_(form, {
    title: "Melhores horarios para resposta",
    required: false
  });

  addCheckbox_(form, {
    title: "Li os Termos e o Aviso de Privacidade publicados pela Strange Works Studio.",
    required: true,
    choices: ["Confirmo que li os documentos publicados."]
  });

  addMultipleChoice_(form, {
    title: "Confirmacao humana",
    required: true,
    choices: ["Estou enviando um pedido real", "Estou testando", "Outro"]
  });

  addParagraph_(form, {
    title: "Algo mais importante para sabermos?",
    helpText: "Nao envie senhas, tokens, CPF, cartao, dados de saude, chaves privadas ou arquivos confidenciais.",
    required: false
  });
}

function addText_(form, spec) {
  const item = form.addTextItem().setTitle(spec.title).setRequired(Boolean(spec.required));
  if (spec.helpText) item.setHelpText(spec.helpText);
  return item;
}

function addEmail_(form, spec) {
  const item = addText_(form, spec);
  const validation = FormApp.createTextValidation()
    .requireTextIsEmail()
    .setHelpText("Informe um email valido.")
    .build();
  item.setValidation(validation);
  return item;
}

function addParagraph_(form, spec) {
  const item = form.addParagraphTextItem().setTitle(spec.title).setRequired(Boolean(spec.required));
  if (spec.helpText) item.setHelpText(spec.helpText);
  return item;
}

function addMultipleChoice_(form, spec) {
  const item = form.addMultipleChoiceItem()
    .setTitle(spec.title)
    .setChoiceValues(spec.choices)
    .setRequired(Boolean(spec.required));
  if (spec.helpText) item.setHelpText(spec.helpText);
  return item;
}

function addCheckbox_(form, spec) {
  const item = form.addCheckboxItem()
    .setTitle(spec.title)
    .setChoiceValues(spec.choices)
    .setRequired(Boolean(spec.required));
  if (spec.helpText) item.setHelpText(spec.helpText);
  return item;
}

function normalizeResponseSheet_(spreadsheet, beforeSheetIds) {
  SpreadsheetApp.flush();
  Utilities.sleep(1500);

  const existingResponseSheet = spreadsheet.getSheetByName(CONFIG.responseSheetName);
  const newSheets = spreadsheet
    .getSheets()
    .filter((sheet) => beforeSheetIds.indexOf(sheet.getSheetId()) === -1);

  if (!newSheets.length) {
    return;
  }

  const formResponseSheet = newSheets[0];
  if (existingResponseSheet && existingResponseSheet.getSheetId() !== formResponseSheet.getSheetId()) {
    existingResponseSheet.setName(CONFIG.responseSheetName + " - Setup Archive");
  }
  formResponseSheet.setName(CONFIG.responseSheetName);
}

function writeFormEvidence_(spreadsheet, form) {
  const repoConfigSheet = ensureSheet_(spreadsheet, CONFIG.repoConfigSheetName, [
    "Field",
    "Current value / action",
    "Can AI complete?",
    "Evidence",
    "Next action"
  ]);
  repoConfigSheet.appendRow([
    "googleFormUrl",
    form.getPublishedUrl(),
    "Created by Apps Script, but still needs public test",
    "Form id: " + form.getId(),
    "Submit a safe public test response, then set googleFormVerified true"
  ]);
  repoConfigSheet.appendRow([
    "googleFormEditUrl",
    form.getEditUrl(),
    "Private operator evidence only",
    "Do not publish edit URL",
    "Store in Setup Evidence/private operator record"
  ]);

  const verificationSheet = ensureSheet_(spreadsheet, CONFIG.verificationSheetName, [
    "Gate",
    "Status",
    "Owner",
    "Evidence",
    "Stop rule",
    "Repo field / doc"
  ]);
  verificationSheet.appendRow([
    "Google Form created",
    "Created, test pending",
    "Operator",
    form.getPublishedUrl(),
    "Do not mark googleFormVerified true until a safe public response lands in the response Sheet.",
    "public-config.js googleFormUrl"
  ]);
}

function ensureSheet_(spreadsheet, name, header) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  const firstRow = sheet.getRange(1, 1, 1, header.length).getValues()[0];
  const hasHeader = firstRow.some((value) => String(value || "").trim());
  if (!hasHeader) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
