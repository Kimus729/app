
export const LOCALES = {
  FR: 'fr',
  EN: 'en',
} as const;

export type Locale = typeof LOCALES[keyof typeof LOCALES];

export const DEFAULT_LOCALE: Locale = LOCALES.FR;

export const translations: Record<string, Record<Locale, string>> = {
  // For metadata in layout.tsx
  appMetaTitle: {
    fr: "VOSDECISIONS", // Changed
    en: "VOSDECISIONS" // Changed
  },
  appMetaDescription: {
    fr: "Empreinte de fichier sur Blockchain",
    en: "File Fingerprint on Blockchain"
  },

  // For page.tsx
  pageTitle: {
    fr: 'VOSDECISIONS',
    en: 'VOSDECISIONS',
  },
  checkFileTitle: {
    fr: 'Vérifier Fichier',
    en: 'Check File',
  },
  vmQueryToolTitle: {
    fr: 'VM Query Tool',
    en: 'VM Query Tool',
  },
  footerCopyright: {
    fr: '© VOSDECISIONS 2025',
    en: '© VOSDECISIONS 2025',
  },
  showText: {
    fr: 'Afficher',
    en: 'Show',
  },
  hideText: {
    fr: 'Masquer',
    en: 'Hide',
  },

  // For file-hash-calculator.tsx
  fileHash_uploadOrDrag: {
    fr: 'Cliquez pour charger ou glissez-déposez',
    en: 'Click to upload or drag and drop',
  },
  fileHash_anyFileType: {
    fr: 'Tout type de fichier',
    en: 'Any file type',
  },
  fileHash_processedLocally: {
    fr: 'Fichier traité localement. Aucune donnée n\'est envoyée sur le web.',
    en: 'File processed locally. No data is sent to the web.',
  },
  fileHash_errorTitle: {
    fr: 'Erreur',
    en: 'Error',
  },
  fileHash_clearFile: {
    fr: 'Effacer le fichier',
    en: 'Clear file',
  },
  fileHash_calculating: {
    fr: 'Calcul du hash...',
    en: 'Calculating hash...',
  },
  fileHash_sha256Hash: {
    fr: 'Empreinte Hash SHA256 :',
    en: 'SHA256 Hash:',
  },
  fileHash_noFileSelected: {
    fr: 'Aucun fichier sélectionné.',
    en: 'No file selected.',
  },

  // For vm-query-form.tsx
  vmQuery_smartContractAddress: {
    fr: 'Adresse du Smart Contract',
    en: 'Smart Contract Address',
  },
  vmQuery_functionName: {
    fr: 'Nom de la Fonction',
    en: 'Function Name',
  },
  vmQuery_arguments: {
    fr: 'Arguments',
    en: 'Arguments',
  },
  vmQuery_argumentPlaceholder: {
    fr: 'Argument',
    en: 'Argument',
  },
  vmQuery_removeArgument: {
    fr: 'Supprimer l\'argument',
    en: 'Remove argument',
  },
  vmQuery_addArgument: {
    fr: 'Ajouter Argument',
    en: 'Add Argument',
  },
  vmQuery_submitQuery: {
    fr: 'Soumettre la Requête',
    en: 'Submit Query',
  },
  vmQuery_querying: {
    fr: 'Requête en cours...',
    en: 'Querying...',
  },
  vmQuery_queryingWithFileHash: {
    fr: 'Requête avec le hash du fichier...',
    en: 'Querying with file hash...',
  },
  vmQuery_errorTitle: {
    fr: 'Erreur',
    en: 'Error',
  },
  vmQuery_blockchainResponse: {
    fr: 'Réponse Blockchain',
    en: 'Blockchain Response',
  },
  vmQuery_noReturnItems: {
    fr: 'Aucun élément retourné à afficher.',
    en: 'No return items to display.',
  },
  vmQuery_groupTitleFallback: { // Fallback if dynamic title fails
    fr: 'Groupe',
    en: 'Group',
  },
  vmQuery_itemsFallback: { // Fallback for group title
    fr: 'Éléments',
    en: 'Items',
  },
  vmQuery_awaitingFileHash: {
    fr: 'En attente du hash du fichier pour la requête...',
    en: 'Awaiting file hash for query...',
  },
  vmQuery_noDataOrIssue: {
    fr: 'Aucune donnée retournée ou un problème est survenu.',
    en: 'No data returned or an issue occurred.',
  },
  vmQuery_tokenIDLabel: { fr: 'ID du Jeton', en: 'Token ID' },
  vmQuery_tokenNameLabel: { fr: 'Nom du Jeton', en: 'Token Name' },
  vmQuery_nonceLabel: { fr: 'Nonce', en: 'Nonce' },
  vmQuery_nftIDLabel: { fr: 'ID du NFT', en: 'NFT ID' },
  vmQuery_nftNameLabel: { fr: 'Nom du NFT', en: 'NFT Name' },
  vmQuery_hashValueLabel: { fr: 'Valeur de l\'empreinte Hash', en: 'Hash Value' },
  vmQuery_transactionIDLabel: { fr: 'ID de la Transaction', en: 'Transaction ID' },
  vmQuery_timestampLabel: { fr: 'Date/heure de l\'écriture', en: 'Timestamp' },
  vmQuery_viewTransactionTitle: { fr: 'Voir la transaction', en: 'View transaction' },
  vmQuery_viewNFTTitle: { fr: 'Voir le NFT', en: 'View NFT' },
  vmQuery_dataNAText: { fr: '(Donnée N/A)', en: '(Data N/A)' },
  vmQuery_emptyText: { fr: '(vide)', en: '(empty)' },
  vmQuery_errorDecodingTokenNameText: { fr: 'ErreurDécodageNomToken', en: 'ErrorDecodingTokenName' },
  vmQuery_missingTokenNameDataText: { fr: 'DonnéesNomTokenManquantes', en: 'MissingTokenNameData' },
  vmQuery_errorDecodingNonceText: { fr: 'ErreurDécodageNonce', en: 'ErrorDecodingNonce' },
  vmQuery_missingNonceDataText: { fr: 'DonnéesNonceManquantes', en: 'MissingNonceData' },
  vmQuery_couldNotConstructNftIdText: { fr: 'Erreur: Impossible de construire l\'ID NFT.', en: 'Error: Could not construct NFT ID.' },
  vmQuery_base64DecodingErrorText: { fr: 'Erreur de décodage Base64:', en: 'Base64 decoding error:' },
  vmQuery_invalidNumberForTimestampText: { fr: 'Nombre invalide pour timestamp:', en: 'Invalid number for timestamp:' },
  vmQuery_invalidDateFromTimestampText: { fr: 'Date invalide depuis timestamp:', en: 'Invalid date from timestamp:' },
  vmQuery_dateConversionErrorText: { fr: 'Erreur de conversion de date:', en: 'Date conversion error:' },
  vmQuery_scAddressAndFuncNameRequiredError: { fr: "L'adresse du Smart Contract et le Nom de la Fonction sont requis.", en: "Smart Contract Address and Function Name are required."},
  vmQuery_cannotAutoQueryError: { fr: "Impossible d'exécuter la requête auto : L'adresse du Smart Contract ou le Nom de la Fonction est manquant. Veuillez les remplir et soumettre manuellement ou recharger le fichier.", en: "Cannot auto-query: Smart Contract Address or Function Name is missing. Please fill them and submit manually or re-upload the file."},

  // For NftImageDisplay.tsx
  nftDisplay_loadingMedia: {
    fr: 'Chargement du média...',
    en: 'Loading media...',
  },
  nftDisplay_mediaFetchErrorTitle: {
    fr: 'Erreur de récupération du média',
    en: 'Media Fetch Error',
  },
  nftDisplay_noMediaToDisplay: {
    fr: 'Aucun média à afficher pour ce NFT.',
    en: 'No media to display for this NFT.',
  },
  nftDisplay_couldNotLoadMedia: {
    fr: 'Impossible de charger le média depuis l\'URL.',
    en: 'Could not load media from URL.',
  },
  nftDisplay_noMediaUrlAvailable: {
    fr: 'Aucune URL de média disponible pour ce NFT.',
    en: 'No media URL available for this NFT.',
  },
  nftDisplay_partialErrorTitle: {
    fr: 'Erreur Partielle',
    en: 'Partial Error',
  },
  nftDisplay_mediaForAlt: {
    fr: 'Média pour',
    en: 'Media for',
  },
  nftDisplay_nftMediaAlt: {
    fr: 'Média NFT',
    en: 'NFT Media',
  },
  nftDisplay_invalidNftIdError: {
    fr: "ID NFT invalide fourni pour la recherche de média.",
    en: "Invalid NFT ID provided for media lookup."
  },
  nftDisplay_apiError: {
    fr: "Erreur API",
    en: "API Error"
  },
  nftDisplay_noMediaUrlInMetaError: {
    fr: "Aucune URL de média trouvée dans les métadonnées NFT récupérées depuis l'URI.",
    en: "No media URL found in NFT metadata fetched from URI."
  },
  nftDisplay_errorFetchingMetaError: {
    fr: "Erreur lors de la récupération/analyse des métadonnées depuis l'URI:",
    en: "Error fetching/parsing metadata from URI:"
  },
  nftDisplay_noDirectMediaOrMetaUriError: {
    fr: "Aucune URL de média directe ou URI de métadonnées trouvée dans la réponse de l'API NFT.",
    en: "No direct media URL or metadata URI found in NFT API response."
  },
  nftDisplay_failedToFetchInfoError: {
    fr: "Échec de la récupération des informations du média NFT.",
    en: "Failed to fetch NFT media information."
  },
  nftDisplay_metadataUriError: {
    fr: "Erreur URI Métadonnées",
    en: "Metadata URI Error"
  },


  // For EnvironmentSwitcher.tsx
  environmentSwitcher_networkLabel: {
    fr: 'Réseau :',
    en: 'Network:',
  },
  environmentSwitcher_selectPlaceholder: {
    fr: 'Sélectionner l\'Environnement',
    en: 'Select Environment',
  },
};
