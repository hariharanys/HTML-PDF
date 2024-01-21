const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(cors());

app.post("/create_pdf", async (req, res) => {
  try {
    const {
      invoiceNo,
      tenant,
      suite,
      address,
      billFrom,
      billTo,
      dateRaised,
      meterInfo,
    } = req.body;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlPath = "./index.html";
    const pdfPath = `./output/${tenant}.pdf`;
    const cssPath = "./index.css";
    const bootStrapJsPath = "./js/bootstrap.bundle.min.js";
    const bootStrapCssPath = "./css/bootstrap.min.css";
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");

    const dynamicHtml = htmlContent
      .replace("%INVOICE_NO%", invoiceNo)
      .replace("%TENANT%", tenant)
      .replace("%SUITE%", suite)
      .replace("%ADDRESS%", address)
      .replace("%BILL_FROM%", billFrom)
      .replace("%BILL_TO%", billTo)
      .replace("%DATE_RAISED%", dateRaised)
      .replace(
        "<!-- REPLACE_WITH_DYNAMIC_TABLES -->",
        generateDynamicTables(meterInfo)
      );

    const cssContent = fs.readFileSync(cssPath, "utf-8");
    const bootStrapCssContent = fs.readFileSync(bootStrapCssPath, "utf-8");
    const bootStrapJsContent = fs.readFileSync(bootStrapJsPath, "utf-8");
    const imageUrl = "https://i.ibb.co/GQS8x4S/tidel.png";

    await page.setContent(dynamicHtml);
    await page.emulateMediaType("screen");
    await page.addStyleTag({ content: cssContent });
    await page.addStyleTag({ content: bootStrapCssContent });
    await page.addScriptTag({ content: bootStrapJsContent });

    await page.pdf({
      path: pdfPath,
      format: "A4",
      preferCSSPageSize: true,
      printBackground: true,
      margin: {
        bottom: "1cm",
        top: "1cm",
      },
    });

    await browser.close();
    const pdfPathAbsolute = path.resolve(__dirname, pdfPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="generated.pdf"'
    );
    res.status(200).sendFile(pdfPathAbsolute);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function generateDynamicTables(meterInfo) {
  let dynamicTables = "";

  meterInfo.forEach((meter) => {
    dynamicTables += `
    <table class="table mb-0 table-borderless p-0 mt-5">
        <thead>
          <tr>
            <th colspan="“6”" class="bg-secondary">Meter Infromation</th>
          </tr>
        </thead>
        <td colspan="“6”" class="p-0">
          <table class="table mb-0 table-borderless p-0">
            <thead>
              <tr>
                <th
                  scope="col"
                  colspan="1"
                  class="bg-light text-start"
                  style="max-width: 7rem"
                >
                  Meter Name
                </th>
                <th scope="col" colspan="1" class="bg-light text-end">
                  Serial No
                </th>
                <th scope="col" colspan="1" class="bg-light text-end">
                  From Date
                </th>
                <th scope="col" colspan="1" class="bg-light text-end">
                  To Date
                </th>
                <th scope="col" colspan="1" class="bg-light text-end">
                  Open Read
                </th>
                <th scope="col" colspan="1" class="bg-light text-end">
                  Close Read
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  scope="col"
                  colspan="1"
                  class="text-start text-wrap text-start"
                  style="max-width: 5rem"
                >
                  ${meter.meterName}
                </td>
                <td
                  scope="col"
                  colspan="1"
                  class="text-start text-wrap text-end"
                >
                  ${meter.serialNo}
                </td>
                <td
                  scope="col"
                  colspan="1"
                  class="text-start text-wrap text-end"
                >
                  ${meter.fromDate}
                </td>
                <td
                  scope="col"
                  colspan="1"
                  class="text-start text-wrap text-end"
                >
                  ${meter.toDate}
                </td>
                <td
                  scope="col"
                  colspan="1"
                  class="text-start text-wrap text-end"
                >
                  ${meter.openRead}
                </td>
                <td
                  scope="col"
                  colspan="1"
                  class="text-start text-wrap text-end"
                >
                  ${meter.closeRead}
                </td>
              </tr>
            </tbody>
          </table>
        </td>
        <tr>
          <td colspan="6" class="p-0">
            <table class="table mb-0 table-borderless p-0">
              <thead>
                <tr>
                  <th colspan="“6”" class="billingHeaderEl">Billing Charges</th>
                </tr>
              </thead>
              <td colspan="6" class="p-0">
                <table class="table mb-0 table-borderless p-0">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        colspan="1"
                        class="bg-light text-start"
                        style="max-width: 2rem"
                      >
                        Item Name
                      </th>
                      <th scope="col" colspan="1" class="bg-light text-end">
                        Quantity
                      </th>
                      <th scope="col" colspan="1" class="bg-light text-end">
                        Units
                      </th>
                      <th scope="col" colspan="1" class="bg-light text-end">
                        Unit Price
                      </th>
                      <th scope="col" colspan="1" class="bg-light text-end">
                        Units
                      </th>
                      <th scope="col" colspan="1" class="bg-light text-end">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        scope="col"
                        colspan="1"
                        class="text-start text-wrap text-start"
                      >
                        ${meter.itemName}
                      </td>
                      <td
                        scope="col"
                        colspan="1"
                        class="text-start text-wrap text-end"
                      >
                        ${meter.quantity}
                      </td>
                      <td
                        scope="col"
                        colspan="1"
                        class="text-start text-wrap text-end"
                      >
                        ${meter.units}
                      </td>
                      <td
                        scope="col"
                        colspan="1"
                        class="text-start text-wrap text-end"
                      >
                        ${meter.unitPrice}
                      </td>
                      <td
                        scope="col"
                        colspan="1"
                        class="text-start text-wrap text-end"
                      >
                        ${meter.unit}
                      </td>
                      <td
                        scope="col"
                        colspan="1"
                        class="text-start text-wrap text-end"
                      >
                        ${meter.price}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <tr>
                  <td colspan="6" class="p-0">
                    <table class="table mb-0 table-borderless p-0">
                      <thead>
                        <tr>
                          <th colspan="3" class="billingHeaderEl">NetTotal</th>
                          <th colspan="3" class="billingHeaderEl text-end">
                            ${meter.netTotal}
                          </th>
                        </tr>
                        <tr>
                          <th colspan="3" class="billingHeaderEl">Total</th>
                          <th colspan="3" class="billingHeaderEl text-end">
                            ${meter.total}
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </td>
                </tr>
              </td>
            </table>
          </td>
        </tr>
      </table>
    `;
  });
  return dynamicTables;
}

app.listen(PORT, () => {
  console.log(`Server is running in this ${PORT}`);
});
