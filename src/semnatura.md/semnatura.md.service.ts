import { Injectable } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { MainDto } from './dto/MainDto';
import { seDateDto } from './dto/seDateDto';
import { seResponsabilDto } from './dto/seResponsabilDto';

const readdir = util.promisify(fs.readdir);

@Injectable()
export class SemnaturaMdService {

  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapeJobListings(mainDto: MainDto) {

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      return await this.executeWithRetry(() => this.start(mainDto,browser));
    } 
    catch (error) {
      return `Error while scraping job listings: ${error}`;
    } 
    finally {
      await browser.close();
    }
    
  }
  async start(mainDto: MainDto, browser:Browser){
    const page = await browser.newPage();

    await page.goto('https://semnatura.md/Home/JpStep1');

    const elementHandle = await page.$("body > div > div.container > div.featurette > p > span");
    const codims = await page.evaluate(element => element.textContent.trim(), elementHandle);

    const client = await page.createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: path.join(process.env.DOWNLOAD_PATH_CONTRACT,codims),
    })
    const pas1 = await this.Pas1(page);
    if(pas1.includes("Eroare")){
      return {status: false ,message: pas1}
    }
    const pas2 = await this.Pas2(page);
    if(pas2.includes("Eroare")){
      return {status: false ,message: pas2}
    }

    for (const angajat of mainDto.angajati) {
      const pas3 = await this.Pas3(page, angajat);
      if(pas3.includes("Eroare")){
        return {status: false ,message: pas3}
      }
    }
    await this.Pas4(page,mainDto.responsabil);
    await this.Pas5(page);
    const codpachet = await this.Pas6(page,codims);
    return {status: true, message : codpachet}

  }
  async executeWithRetry(fn: () => Promise<any>, retries: number = 5): Promise<any> {
    let lastError;

    for (let i = 0; i < retries; i++) {
      console.log("Incercari efectuate :" + i)
      try {
          return await fn();
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${i + 1} failed: ${error}`);
        if (i < retries - 1) {
          // Așteaptă înainte de a încerca din nou
          await new Promise(resolve => setTimeout(resolve, 100)); // 2 secunde
        }
      }
    }
    throw lastError;
  }
  async Pas1(page : Page){
    try{

      const idnoElement = "#idno";
      await page.waitForSelector(idnoElement);
      await page.click(idnoElement);
      await page.type(idnoElement,process.env.IDNO);//introducerea idno 
      await page.click("#idnoForm > div:nth-child(3) > button");//pasul urmator
      return "true"
    }
    catch(error){
      throw new Error(`Eroare la pas1: ${error.message}`);
    }
  }
  async Pas2(page: Page){
    console.log('Start Pas2')
    try{
      const persJuridic = "body > div > div.container > div.featurette > b > div > div:nth-child(1) > a:nth-child(2)";
      await page.waitForSelector(persJuridic);
      await page.click(persJuridic);//accesare persoana juridica
      console.log('Start Pas2 - click persJuridic')

      await page.waitForNavigation({ waitUntil: 'load' });

      const comandanoua = "#idnoForm > div:nth-child(3) > div:nth-child(1) > a";
      const elementExists = await page.$(comandanoua);
      if (elementExists) {
        await page.waitForSelector(comandanoua);
        await page.click(comandanoua);
      } 
      this.delay(500);
      const codfiscal = "#FiscalCode";
      await page.waitForSelector(codfiscal);
      await page.click(codfiscal);
      console.log('Start Pas2 - click codfiscal')
      const oras = "#City";
      await page.click(oras);
      await page.type(oras,process.env.IDNO_ORAS);
      const zipcode = "#ZipCode";
      await page.click(zipcode);
      await page.type(zipcode,process.env.IDNO_ZIPCODE);
      const adress = "#Street";
      await page.click(adress);
      await page.type(adress,process.env.IDNO_ADRRES);
      const accaunt = "#Account";
      await page.click(accaunt);
      await page.type(accaunt,process.env.IDNO_BANCACCAUNT);
      const bankcode = "#BankCode";
      await page.waitForSelector(bankcode);
      await page.click(bankcode);

      await this.delay(500);
      const pasUrmator = "#JuridicalPerson > div.row > div:nth-child(3) > button";
      await page.click(pasUrmator);
        
      await page.waitForNavigation({ waitUntil: 'load' });

      // Verifică dacă atributul 'generated' este setat și are valoarea 'true'
      const validareCodfiscal = "#JuridicalPerson > div:nth-child(5) > div > span > span"
      const elementHandle = await page.$(validareCodfiscal);
      if (elementHandle) {
        const attributeValue = await page.evaluate(el => el.getAttribute('generated'), elementHandle);

        if (attributeValue === 'true') {
          console.log('Atributul generated="true" există pe element.');
          await page.type(codfiscal,process.env.IDNO);
          await page.click(pasUrmator);
        } 
      } 
      return "true"
    }

    catch(error){
      console.log(`Eroare la pas2 : ${error}`);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if(errorMessage.includes('Error: Execution context was destroyed')){
        throw new Error("Regenereaza pachetul din nou")
      }
      throw new Error(`Eroare la pas2 : ${error}`)
    }
  }
  async Pas3(page: Page, angajati : seDateDto){
    console.log('Start Pas3')
    try{
      await page.waitForNavigation({ waitUntil: 'load' });

      const AddEmployee = "body > div:nth-child(1) > div.container > div.featurette > div:nth-child(6) > div:nth-child(2) > a";
      await page.waitForSelector(AddEmployee);
      await page.click(AddEmployee);
      const nume = "#LastName";
      await page.waitForSelector(nume);
      await page.click(nume);
      await page.type(nume,angajati.nume);
      const prenume = "#FirstName";
      await page.click(prenume);
      await page.type(prenume,angajati.prenume);
      const idnp = "#Idnp";
      await page.click(idnp);
      await page.type(idnp,angajati.idnp.toString());
      const email = "#Email";
      await page.click(email);
      await page.type(email,angajati.posta);
      const telefon = "#Phone";
      await page.click(telefon);
      await page.type(telefon,angajati.telefonPersonal.toString());
      const functia = "#Position";
      await page.click(functia);
      await page.type(functia,angajati.functia);
      await this.delay(500);

      if(angajati.stick){
        const bifStic = "#EmployeeForm > div:nth-child(10) > div > div.col-xs-1 > label";
        await page.waitForSelector(bifStic)
        await page.click(bifStic);
      }
      if(angajati.perioada === 1){
        const an1 = "#EmployeeForm > div:nth-child(11) > div:nth-child(10) > div.col-xs-1 > label";
        await page.waitForSelector(an1)
        await page.click(an1);
      }
      if(angajati.perioada === 2){
        const an2 = "#EmployeeForm > div:nth-child(11) > div:nth-child(18) > div.col-xs-1 > label";
        await page.waitForSelector(an2)
        await page.click(an2);
      }
      if(angajati.perioada === 5){
        const an5 = "#EmployeeForm > div:nth-child(11) > div:nth-child(43) > div.col-xs-1 > label";
        await page.waitForSelector(an5)
        await page.click(an5);
      }
      const bif1 = "#Aknowledge";
        await page.waitForSelector(bif1)
        await page.click(bif1);
      const bif2 ="#EmployeeForm > div:nth-child(14)";
        await page.waitForSelector(bif2)
        await page.click(bif2);
      const bif3 = "#EmployeeForm > div:nth-child(15) > label";
        await page.waitForSelector(bif3)
        await page.click(bif3);
      const adaugare = "#EmployeeForm > div:nth-child(17) > div:nth-child(3) > button";
        await page.waitForSelector(adaugare)
        await page.click(adaugare);
        await this.delay(500); 
        return "true"
    }
    catch(error){
      console.log(`Eroare la pas3 : ${error}`);
      throw new Error(`Eroare la pas3 : ${error}`)
    }
  }

  
  async Pas4(page: Page, responsabil : seResponsabilDto){
    console.log('Start Pas4')
    try{
      await page.goto("https://semnatura.md/Home/AddResponsible");
      await page.waitForNavigation({ waitUntil: 'load' });

      const numeprenume = "#NumePrenume";
      await page.waitForSelector(numeprenume);
      await page.click(numeprenume);
      await page.type(numeprenume,`${responsabil.nume} ${responsabil.prenume}`);
      const idnpresponsabil = "#Idnp";
      await page.click(idnpresponsabil);
      await page.type(idnpresponsabil,responsabil.idnp.toString());
      const telefon = "#Phone";
      await page.click(telefon);
      await page.type(telefon,responsabil.telefon.toString()); //#Email
      const email = "#Email";
      await page.click(email);
      await page.type(email,responsabil.email);
      const bif4 = "#ResponsibleForm > div:nth-child(7) > label";
      await page.click(bif4);
      const bif5 = "#ResponsibleForm > div:nth-child(8) > label";
      await page.click(bif5);
      const bif6 = "#ResponsibleForm > div:nth-child(9) > label";
      await page.click(bif6);
      const respbuto = "#ResponsibleForm > div.row > div:nth-child(3) > button";
      await page.click(respbuto);
    }
    catch(error){
      throw new Error(`Eroare la pas4 :${error}`)
    }
  }
  async Pas5(page: Page){
    console.log('Start Pas5')
    try{
      await page.goto("https://semnatura.md/Home/JpStep5");
      await page.waitForNavigation({ waitUntil: 'load' });

      const trasnmitcomand = "#submitForm > div > div:nth-child(3) > button";
      await page.waitForSelector(trasnmitcomand, { timeout: 2000 }); // așteaptă maxim 10 secunde
      await page.click(trasnmitcomand);
    }
    catch(error){
      throw new Error(`Eroare la pas5 :${error}`);
    }
  }

  async Pas6(page: Page,codpachet:string){
    console.log('Start Pas6')
    try{
      const contract = "body > div > div.container > div.featurette > b > div:nth-child(5) > div:nth-child(2) > a > h5";
      await page.waitForSelector(contract, { timeout: 5000 }); // așteaptă maxim 10 secunde
      
      // Așteaptă până când elementul devine disponibil pe pagină
      await page.waitForFunction(
        (selector) => document.querySelector(selector) !== null,
        {},
        contract
      );
      await page.click(contract);
      const certificare = "body > div > div.container > div.featurette > b > div:nth-child(5) > div:nth-child(3) > a > h5";
      await page.click(certificare);
      const centralizat = "body > div > div.container > div.featurette > b > div:nth-child(5) > div:nth-child(4) > a > h5";
      await page.click(centralizat);
      const contplata = "body > div > div.container > div.featurette > b > div:nth-child(5) > div:nth-child(5) > a > h5";
      await page.click(contplata);

      let files;
      let pdfCount;
      while (pdfCount !== 4) {
        // Delay for 1 second
        await this.delay(500);
        files = await readdir(path.join(process.env.DOWNLOAD_PATH_CONTRACT,codpachet));
        pdfCount = files.filter(file => path.extname(file).toLowerCase() === '.pdf').length;
      }
      
      const finalizeazacomanda = "body > div > div.container > div.right-banner.thumbnail.shadow.hidden-xs > div > a";
      await page.click(finalizeazacomanda);
      const confirmcomanda = "#ConfirmStartNewTr";
      await page.waitForSelector(confirmcomanda);
      await page.click(confirmcomanda);
      return codpachet
    }
    catch(error){
      throw new Error(`Eroare la pas6 :${error}`)
    }
  }
  public async createFolder(folderPath: string): Promise<void> {
    try {
      // Verifică dacă directorul există
      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
      }
      // Creează directorul (recursive: true creează toate directoarele necesare)
      fs.mkdirSync(folderPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating folder: ${error.message}`);
    }
  }
}
