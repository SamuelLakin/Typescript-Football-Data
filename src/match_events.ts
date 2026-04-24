import * as fs from "fs";

interface PremierLeague {
    competition: string,
    season: string,
    matches: Matches[]
}

interface Matches {
    id: string,
    date: string,
    homeTeam: string,
    awayTeam: string,
    events: Event[],
}

interface Event {
    minutes: number,
    type: string,
    player: string,
    team: string

}

function matchScorelines() {
    const raw = fs.readFileSync("data/match_events.json", "utf-8");
    const data:PremierLeague = JSON.parse(raw);

    data.matches.forEach((match: Matches) => {

        const homeGoals = match.events.filter((e: Event) => e.type === "goal" && e.team === match.homeTeam).length

        const awayGoals = match.events.filter((e:Event) => e.type === "goal" && e.team === match.awayTeam).length

        console.log(`${match.homeTeam} ${homeGoals} -  ${awayGoals} ${match.awayTeam}`)
    })

}

function firstGoalperMatch() {
    const raw = fs.readFileSync("data/match_events.json", "utf-8");
    const data:PremierLeague  = JSON.parse(raw);

    data.matches.forEach((match: Matches) => {
        let firstgoal = match.events.find((e: Event) => e.type === "goal")

        console.log(`${firstgoal!.player} (${firstgoal!.team}) - minute ${firstgoal!.minutes}`);

    })
}

function playerGoalTally() {
    const raw = fs.readFileSync("data/match_events.json", "utf-8");
    const data:PremierLeague = JSON.parse(raw);

    let event = data.matches.flatMap((match: Matches) => match.events).filter((e: Event) => e.type === "goal")
    let goalsScored = event.reduce((g: any, p:any) => {
        g[p.player] = (g[p.player] ?? 0) + 1;

        return g;
    }, {})

    Object.entries(goalsScored)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .forEach(([player, goals], i) => {
        console.log(`${i + 1}. ${player} — ${goals} goals`);
    });
}

matchScorelines()
firstGoalperMatch()
playerGoalTally()