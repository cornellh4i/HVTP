<br />
<h1>Cornell Hack4Impact</h1>

<div>
  <a href="https://github.com/cornellh4i/IMA">
    <img src="https://media.licdn.com/dms/image/v2/C560BAQGDbdhpmxRmrg/company-logo_200_200/company-logo_200_200/0/1633548685050/hack4impact_logo?e=2147483647&v=beta&t=Cgni3x2P5I8nwhyAaHkblCo0OP6yx857PLG7O5Zw_W4" alt="Logo" width="120" height="120">
  </a>

  <p >
    Hack4Impact is a student-led organization that aims to develop projects to assist nonprofit organizations in the Cornell-Ithaca community and beyond. Hack4Impact mission is to empower engineers, designers, activists, and humanitarians to create lasting and impactful social change, fostering the wider adoption of software as a tool for social good. 
    <br />    
  </p>
</div>

<h2>HVTP (Hudson Valley Textile Project)</h2>
  <p>
    The Husdon Valley Textile Project is a nonprofit and business accelerator building a sustainable regional fiber supply chain. 
    Through its Northeast Fiber Exchange (NEFX) initiative, HVTP operates as a specialized intermediary and warehouse for the Northeast's 
    wool industry. NEFX provides a vital marketplace connecting regional farmers with consumers while promoting sustainable fiber by enforcing 
    animal welfare and quality specifications.
    <br />    
  </p>
</div>

## About

This repo contains the inventory platform built for HVTP's Northeast Fiber
Exchange. Wool arrives from regional farmers as lots, each with a shear date
and weight, and is tracked through storage and processing until it's sold —
often in pieces, to several buyers. The platform handles lot intake, sales,
QR scanning for warehouse lookups, a public inventory listing for buyers,
automatic storage reminders, and a metrics dashboard.

```text
frontend/   Next.js (React, TypeScript, Tailwind)
backend/    Express (TypeScript) with Cloud Firestore
```

Authentication and image storage both use Firebase. The frontend never talks
to Firestore directly — all data goes through the backend API.


## Documentation

- [HVTP Frontend Documentation](./frontend/README.md)
- [HVTP Backend Documentation](./backend/README.md)

## Deployment

Both apps are containerized with Docker and deployed to DigitalOcean. The app is deployed for client use at [text](https://hvtp-platform-exwqb.ondigitalocean.app)

## Contributors

### Spring 2026

- Technical Lead
  - Jeremy Cortez
- Project Manager
  - Arianna Hsu
- Developers
  - Carl Hu
  - Oshin Rex 
  - Rohan Sahu
  - Lillian Wang
  - Sydney Chin
  - Jack Nguyen
- Designers
  - Aiden Montesinos
  - Shun Tanaka
  - Dhikshika Cherivirala
