import * as fs from "fs";

interface League {
    league: string,
    season: string,
    teams: Team[],
}

interface Team {
    id: string,
    name: string,
    city: string,
    stadium: string,
    capacity: number,
    squad: Squad[]
}

interface Squad {
    id: string,
    name: string,
    position: "GK" | "DF" | "MF" | "FW"
    nationality: string,
    appearances: number,
    age: number,
    goals: number,
    assists: number,
    yellowCards: number,
    redCard: number,
    rating: number,
}

type SquadWithTeamName = Squad & {teamName: string}

function listTeams() {
    const raw = fs.readFileSync("data/squad data.json", "utf-8");
    const data = JSON.parse(raw);

    data.teams.forEach((team: Team) => console.log(`${team.name} — ${team.stadium}`));
}

function countByPosition() {
    const raw = fs.readFileSync("data/squad data.json", "utf-8");
    const data:League = JSON.parse(raw);
    let df = data.teams.flatMap((team:Team) => team.squad.filter((player: Squad)=> player.position === "DF")).length 
    let fw = data.teams.flatMap((team:Team) => team.squad.filter((player: Squad)=> player.position === "FW")).length 
    let gk = data.teams.flatMap((team:Team) => team.squad.filter((player: Squad)=> player.position === "GK")).length 
    let mf = data.teams.flatMap((team:Team) => team.squad.filter((player: Squad)=> player.position === "MF")).length 

    console.log("DF: " + df, "\nFW: " + fw, "\nGK: " + gk, "\nMF: " + mf);
}

function disciplinaryReport() {
    const raw = fs.readFileSync("data/squad data.json", "utf-8")
    const data: League = JSON.parse(raw);
    let yellowCards;

    yellowCards = data.teams
    .flatMap((m: Team) => m.squad
    .map((p:Squad) => ({...p, teamName: m.name}))
    .filter((p: Squad) => p.yellowCards >= 5).sort((a, b) => b.yellowCards - a.yellowCards))
   yellowCards.forEach((p: SquadWithTeamName) => {
        console.log(`${p.name} (${p.teamName}) - ${p.yellowCards} yellow cards`);
   });

}

// Run separatley: npx ts-node src/squad.ts English
function playersByNationality() {
    const nationality = process.argv[2];
    if (!nationality) { console.log("Usage: ts-node solution.ts <nationality>"); return; }
    const raw = fs.readFileSync("data/squad data.json", "utf-8")
    const data = JSON.parse(raw);

    let playerNationality = data.teams
    .flatMap((team : Team) => team.squad
    .filter((player: Squad) => player.nationality === nationality)).map((player:Squad) => player.name);

    console.log(playerNationality);
}

function topGoalScorers(){
    const raw = fs.readFileSync("data/squad data.json", "utf-8");
    const data = JSON.parse(raw);

    let goalScores = data.teams
    .flatMap((team: Team) => team.squad
    .map((player: Squad) => ({...player, teamName: team.name}))).sort((a:SquadWithTeamName, b:SquadWithTeamName) => b.goals - a.goals)

    goalScores.forEach((p:SquadWithTeamName) => {
        console.log(`${p.name} (${p.teamName}) - ${p.goals} goals`);
    })

}

function averageRatingByTeam() {
    const raw = fs.readFileSync("data/squad data.json", "utf-8");
    const data: League = JSON.parse(raw);

    data.teams
        .map((team: Team) => {
        const avg = team.squad.reduce((sum: number, p: Squad) => sum + p.rating, 0) / team.squad.length;
        return { name: team.name, avg };
        })
        .sort((a, b) => b.avg - a.avg)
        .forEach((team, i) => {
        console.log(`${i + 1}. ${team.name} — ${team.avg.toFixed(2)}`);
        });
}

function goalContributions () {
    const raw = fs.readFileSync("data/squad data.json", "utf-8");
    const data = JSON.parse(raw);

    let topContribution = data.teams
    .flatMap((team:Team) => team.squad
    .map((player:Squad) => ({...player, teamName: team.name})))
    .sort((a:Squad, b:Squad) => (b.goals + b.assists) - (a.goals + a.assists));

    for(let i = 0; i <= 4; i++ ){
        console.log(`${i + 1}. ${topContribution[i].name} (${topContribution[i].teamName}) G: ${topContribution[i].goals} A: ${topContribution[i].assists} Total: ${topContribution[i].goals + topContribution[i].assists}`)
    }

}

function squadSummary() {
    const raw = fs.readFileSync("data/squad data.json", "utf-8")
    const data = JSON.parse(raw);

    const sumStat = (squad: Squad[], key: keyof Squad): number =>
        squad.reduce((sum, p) => sum + (p[key] as number), 0);

        data.teams.forEach((team: Team) => {
            const goals = sumStat(team.squad, "goals");
            const assists = sumStat(team.squad, "assists");
            const yellows = sumStat(team.squad, "yellowCards");
            const avgAge = (sumStat(team.squad, "age") / team.squad.length).toFixed(1);
            const topRated = team.squad.reduce((best: Squad, p: Squad) =>
            p.rating > best.rating ? p : best
            );

    console.log(`${team.name}`);
    console.log(`  Goals: ${goals} | Assists: ${assists} | Yellow cards: ${yellows}`);
    console.log(`  Average age: ${avgAge}`);
    console.log(`  Top rated: ${topRated.name} (${topRated.rating})`);
    console.log("---");
  });
}

listTeams();
countByPosition();
disciplinaryReport();
topGoalScorers();
averageRatingByTeam();
goalContributions();
squadSummary();