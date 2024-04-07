
function addCompany(event) {
    event.preventDefault();
  
    // Get the input value
    const input = document.querySelector("#companyInput");
    const inputValue = input.value;
  
    // Make a request to get the company data
    fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${inputValue}`)
      .then((response) => response.json())
      .then((data) => {
        // Create a new company object
        const company = {
          name: data.navn,
          orgNumber: data.organisasjonsnummer,
          companyType: data.organisasjonsform.beskrivelse,
          industryCode: data.naeringskode1.beskrivelse,
          address: data.forretningsadresse.adresse.join(", "),
          postCode: data.forretningsadresse.postnummer,
          postArea: data.forretningsadresse.poststed,
          municipality: data.forretningsadresse.kommune,
          numberOfEmployees: data.antallAnsatte,
          registrationDate: data.registreringsdatoEnhetsregisteret,
          registeredForVAT: data.registrertIMvaregisteret,
          voluntaryVATRegistration: data.frivilligMvaRegistrertBeskrivelser,
          lastAnnualReport: data.sisteInnsendteAarsregnskap,
          bankruptcy: data.konkurs,
          underLiquidation: data.underAvvikling,
          underCompulsoryLiquidation: data.underTvangsavviklingEllerTvangsopplosning,
        };
  
        // Add the company to the list
        const companyList = document.querySelector("#companyList");
        const companyItem = document.createElement("li");
        companyItem.innerHTML = `${company.name} (${company.orgNumber}) - ${company.companyType} - ${company.address}, ${company.postCode} ${company.postArea}`;
        companyList.appendChild(companyItem);
  
        // Clear the input field
        input.value = "";
      })
      .catch((error) => console.log(error));
  }
  
  function showCompanyForm() {
    document.getElementById('company-form').style.display = 'block';
  }
  
  function hideCompanyForm() {
    document.getElementById('company-form').style.display = 'none';
  }
  
  
  document.getElementById('company-form').addEventListener('submit', addCompany);
  