function addCompany(event) {
  event.preventDefault();

  // Get the input value for the organization number
  const input = document.querySelector("#companyInput");
  const inputValue = input.value.trim();

  if (!inputValue) {
      alert("Please enter a valid organization number");
      return;
  }

  // Fetch company data from Brreg
  fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${inputValue}`)
    .then(response => {
      if (!response.ok) {
          throw new Error("Failed to fetch company data");
      }
      return response.json();
    })
    .then(data => {
      // Assuming 'adresse' is an array and might be empty
      const address = data.forretningsadresse.adresse ? data.forretningsadresse.adresse.join(", ") : "No address provided";
      
      // Create a new company object
      const company = {
        name: data.navn || "No name provided",
        orgNumber: data.organisasjonsnummer,
        companyType: data.organisasjonsform ? data.organisasjonsform.beskrivelse : "No type provided",
        industryCode: data.naeringskode1 ? data.naeringskode1.beskrivelse : "No industry code",
        address: address,
        postCode: data.forretningsadresse.postnummer || "No post code",
        postArea: data.forretningsadresse.poststed || "No post area",
        municipality: data.forretningsadresse.kommune || "No municipality",
        numberOfEmployees: data.antallAnsatte,
        registrationDate: data.registreringsdatoEnhetsregisteret,
        registeredForVAT: data.registrertIMvaregisteret,
        voluntaryVATRegistration: data.frivilligMvaRegistrertBeskrivelser,
        lastAnnualReport: data.sisteInnsendteAarsregnskap,
        bankruptcy: data.konkurs,
        underLiquidation: data.underAvvikling,
        underCompulsoryLiquidation: data.underTvangsavviklingEllerTvangsopplosning,
      };

      // Add the company to GunDB (Example: Storing under "companies" node)
      const gun = Gun({ peers: ['https://gun-relay.valiantlynx.com/gun', 'http://localhost:8765/gun'] }); // Ensure you've initialized Gun correctly earlier in your script
      gun.get('companies').set(company);

      // Also add to the UI list
      const companyList = document.querySelector("#companyList");
      const companyItem = document.createElement("li");
      companyItem.innerHTML = `${company.name} (${company.orgNumber}) - ${company.companyType} - ${company.address}, ${company.postCode} ${company.postArea}`;
      companyList.appendChild(companyItem);

      // Clear the input field
      input.value = "";
    })
    .catch(error => {
      console.error(error);
      alert("Failed to add company. See console for details.");
    });
}

document.querySelector("#company-form").addEventListener("submit", function(event) {
  addCompany(event); // Bind the addCompany function to the form submission
});

function showCompanyForm() {
  document.getElementById('company-form').style.display = 'block';
}

function hideCompanyForm() {
  document.getElementById('company-form').style.display = 'none';
}
