import * as fs from "fs";

interface UCL {
    tournament: string,
    season: string,
    groups: Groups[]
}

interface Groups {
    id: string,
    teams: string[],
    matches: Matches[],
}

interface Matches {
    id: string,
    date: string,
    homeTeam: string,
    awayTeam: string,
    events: Events[],
}

interface Events {
    minute: number,
    type: string,
    player: string,
    team: string
}

type EventsWithId = Events & {id:string}

function groupScorelines() {
    const raw = fs.readFileSync("data/Champions_league.json", "utf-8");
    const data:UCL = JSON.parse(raw);

    data.groups.forEach((group :Groups) => {
        group.matches.forEach((match:Matches) =>{
            let homeGoals = match.events.filter((event: Events) => event.type === "goal" && event.team === match.homeTeam).length;
            let awayGoals = match.events.filter((event: Events) => event.type === "goal" && event.team === match.awayTeam).length

            console.log(`${match.homeTeam} ${homeGoals} - ${awayGoals} ${match.awayTeam}`)
        })
    })
}

function redCardIncidents() {
    const raw = fs.readFileSync("data/Champions_league.json", "utf8");
    const data: UCL = JSON.parse(raw);

    data.groups.forEach((group: Groups) => {

       let redCards:EventsWithId[]  = group.matches.flatMap((match: Matches) => match.events.filter((event: Events) => event.type === "red_card").map((e: Events) => ({...e, id: match.id})))


    redCards.forEach((red: EventsWithId) => {
        redCards.sort((a,b) => a.minute - b.minute)
        console.log(`${red.player} (${red.team}) - ${red.id}, minute ${red.minute}`)
    })
    })

}

function goalsByTeam() {
    const raw = fs.readFileSync("data/Champions_league.json", "utf8");
    const data: UCL = JSON.parse(raw);

    data.groups.forEach((group: Groups) => {
        let goals = group.matches.flatMap((match: Matches) => match.events.filter((event: Events) => event.type === "goal"))
        
        let tally = goals.reduce((acc: Record<string, number>, e: Events) => {
            acc[e.team] = (acc[e.team] ?? 0) + 1;
            return acc
        }, {})
        console.log(`Group ${group.id}: `);
        Object.entries(tally).sort((a,b) => b[1] - a[1]).forEach(([team, goals]) => {
            console.log(`${team} - ${goals} goals`)
        })    })
}

function goalsByTimeBand() {
    const raw = fs.readFileSync("data/Champions_league.json", "utf8");
    const data: UCL = JSON.parse(raw);

    const allEvents = data.groups.flatMap((group: Groups) => group.matches.flatMap((match: Matches) => match.events.filter((e:Events) => e.type==="goal")));

    const bands = allEvents.reduce((acc, e:Events) => {
        if (e.minute <= 45 ) acc.firstHalf++
        else if (e.minute < 90) acc.secondHalf++
        else acc.stoppageTime++
        return acc
    }, {firstHalf: 0, secondHalf: 0, stoppageTime: 0})

    console.log(`First Half (1-45) ${bands.firstHalf} goals`)
    console.log(`Second Half (45-90) ${bands.secondHalf} goals`)
    console.log(`Stoppage Time (90+) ${bands.stoppageTime}`)
}

function cardsByPlayer() {
    const raw = fs.readFileSync("data/Champions_league.json", "utf8");
    const data: UCL = JSON.parse(raw);

    const event = data.groups.flatMap((group: Groups) => group.matches.flatMap((match: Matches) => match.events.filter((e: Events) => e.type === "yellow_card" || e.type === "red_card")))

    let count = event.reduce((acc: Record<string, {yellow:number, red:number}>, e: Events) =>{
        if(!acc[e.player]) acc[e.player] ??= {yellow: 0, red: 0}
        if(e.type === "yellow_card") acc[e.player]!.yellow++
        else if(e.type === "red_card") acc[e.player]!.red++

        return acc
    },{})
    console.log(count)

    Object.entries(count).filter(([__, cards]) => cards.yellow + cards.red > 1).sort((a,b) => (b[1].yellow +b[1].red) - (a[1].yellow + a[1].red)).forEach(([player, cards]) => {
        console.log(`${player} - ${cards.yellow} yellow, ${cards.red} red`)
    }) 
}

groupScorelines()
redCardIncidents()
goalsByTeam()
goalsByTimeBand()
cardsByPlayer()