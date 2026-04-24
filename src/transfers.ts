import * as fs from "fs";

interface TransferWindow {
    window: string,
    clubs: Club[]
}

interface Club {
    id: string
    name: string,
    league: string,
    budget: number,
    transfers: Transfer[]
}

interface Transfer {
    id: string,
    player: string,
    type: "in" | "out",
    fee: number,
    fromClub?: string
    toClub?: string,
    nationality: string,
    position: string,
    age: number,
    rating: number
}

type TransferWithClub = Transfer & { club: string };

function listClubs() {

    const raw = fs.readFileSync("data/transfers.json", "utf-8")
    const data: TransferWindow = JSON.parse(raw);

    data.clubs.forEach((club: Club) => 
        console.log(`${club.name} - ${club.league}`)
    )
}

function freeTransfers() {
    const raw = fs.readFileSync("data/transfers.json", "utf-8")
    const data: TransferWindow = JSON.parse(raw);

    let freeTransfersOut:TransferWithClub[] = data.clubs.flatMap((club: Club) => club.transfers.filter((transfer: Transfer) => transfer.fee === 0 && transfer.type === "in" ).map((trans: Transfer) => ({...trans, club:club.name})))

    freeTransfersOut.forEach((e: TransferWithClub,) => {
        console.log(`${e.player} - ${e.club} (from ${e.fromClub})`)
    })

}

// run separately: npx ts-node src/transfers.ts Arsenal
function transfersByClub() {
    const clubName = process.argv[2]

    const raw = fs.readFileSync("data/transfers.json", "utf-8")
    const data: TransferWindow = JSON.parse(raw);
    if (!clubName) { console.log("Usage: ts-node solution.ts <club>"); return; }
    
    let club = data.clubs.filter((club: Club) => clubName === club.name)

    if (club.length === 0) { console.log(`Club not found: ${clubName}`); return; }


    club[0]!.transfers.forEach((t: Transfer) => {
        if(t.fromClub){
            console.log(`IN: ${t.player}  (from ${t.fromClub}) - £${t.fee/1000000} M`)
        }
        else if( t.toClub){
            console.log(`OUT: ${t.player}  (to ${t.toClub}) - £${t.fee/1000000} M`)
        }
 
    })
    
}

// run separately: npx ts-node src/transfers.ts English
function transfersByNationality() {
    const nationality = process.argv[2];

    if (!nationality) { console.log("Usage: ts-node solution.ts <nationality>"); return; }
  

    const raw = fs.readFileSync("data/transfers.json", "utf-8")
    const data: TransferWindow = JSON.parse(raw);

    let players = data.clubs.flatMap((club: Club) => club.transfers.filter((transfer: Transfer) => transfer.nationality === nationality).map((t: Transfer) => ({...t, club: club.name})));

    if (players.length === 0) { console.log(`No players found for: ${nationality}`); return; }

    players.forEach((player) => {
        if(player.type === "in"){
            console.log(`${player.player} IN at ${player.club}`)
        }
        if(player.type === "out"){
            console.log(`${player.player} OUT from ${player.club}`)
        }
    })
}

function spentByClub() {
    const raw = fs.readFileSync("data/transfers.json", "utf-8")
    const data: TransferWindow = JSON.parse(raw);

   let transfersIn = data.clubs.flatMap((club: Club) => club.transfers.filter((t: Transfer) => t.type === "in").map((t: Transfer) => ({...t, club: club.name})))

   let cost = transfersIn.reduce((acc: Record<string, number>, t: TransferWithClub) => {
        acc[t.club] = (acc[t.club] ?? 0) + (t.fee/1000000)
        return acc
   }, {})

   Object.entries(cost).sort((a,b) => b[1] - a[1]).forEach(([team, cost]) => 
        console.log(`${team} - £${cost} m`)
    )
}

function transfersByPosition() {
    const raw = fs.readFileSync("data/transfers.json", "utf-8")
    const data: TransferWindow = JSON.parse(raw);

    let transfers = data.clubs.flatMap((club: Club) => club.transfers);

    let allTransfers = transfers.reduce((acc: Record<string, number>, t: Transfer) =>{
        acc[t.position] ??= 0
        acc[t.position] = (acc[t.position] ?? 0) +1;
        return acc
    }, {})

    Object.entries(allTransfers).sort((a,b) => a[0].localeCompare(b[0])).forEach(([position, count])=> {
        console.log(`${position}: ${count}`)
    })
}

function netSpentByClub() {
    const raw = fs.readFileSync("data/transfers.json", "utf-8")
    const data: TransferWindow = JSON.parse(raw);

    let transfers = data.clubs.flatMap((club: Club) => club.transfers.map((t:Transfer) => ({...t, club: club.name})))

    let netCost = transfers.reduce((acc: Record<string, {in: number, out:number}>, t: (TransferWithClub)) => {
        acc[t.club] ??= {in: 0, out: 0}

        if(t.type === "in") acc[t.club]!.in += t.fee
        else if(t.type === "out") acc[t.club]!.out +=t.fee

        return acc
    }, {} as Record<string, {in: number, out: number}>)

    Object.entries(netCost).map(([club, fees]) => ({club, net: (fees.in - fees.out) / 1000000})).sort((a,b) => b.net - a.net).forEach(({club, net}) => {
        const sign = net >= 0 ? "+" : "-"
        console.log(`${club}: ${sign}£${Math.abs(net)}m`)
    })
}

listClubs()
freeTransfers()
spentByClub()
transfersByPosition()
netSpentByClub()