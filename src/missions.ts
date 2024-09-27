import axios, { AxiosError } from "axios";
import chalk from "chalk";
import { tokens } from "./credentials.js";

interface Header {
  status: number;
  message: string;
}

interface Mission {
  uid: number;
  text: string;
  link: string;
  rewardId: number;
  rewardAmount: number;
  status: number;
}

interface MissionListResponse {
  header: Header;
  body: {
    gameList: Mission[];
    communityList: Mission[];
  };
}

interface MissionRewardClaimResponse {
  header: Header;
  body?: null;
}

async function fetchMissionList(token: string): Promise<Mission[]> {
  try {
    const response = await axios.get<MissionListResponse>(
      "https://backend.pixelheroes.io/playtomint/missionlist",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.header.status === 200) {
      const gameMissions = response.data.body.gameList || [];
      const communityMissions = response.data.body.communityList || [];
      const allMissions = [...gameMissions, ...communityMissions];
      return allMissions.filter((mission) => mission.status != 5);
    } else {
      console.log(
        chalk.red("Failed to fetch mission list:", response.data.header.message)
      );
      return [];
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(chalk.red("Error fetching mission list:"), error.message);
    } else if (error instanceof Error) {
      console.error(chalk.red("Error fetching mission list:"), error.message);
    } else {
      console.error(chalk.red("Unknown error occurred"));
    }
    return [];
  }
}

async function claimMission(token: string, mission: Mission) {
  try {
    const response = await axios.post<MissionRewardClaimResponse>(
      "https://backend.pixelheroes.io/playtomint/missionRewardClaim",
      { uid: mission.uid },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const status = response.data.header.status;
    const message = response.data.header.message;

    if (
      status === 200 ||
      (status === 201 && message === "Mission already accomplished.")
    ) {
      console.log(
        chalk.green(
          `Mission UID ${mission.uid} completed successfully: ${mission.text}`
        )
      );
    } else {
      console.log(
        chalk.red(`Mission UID ${mission.uid}: ${message || "Unknown error"}`)
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(chalk.red(`Mission UID ${mission.uid}: ${error.message}`));
    } else if (error instanceof Error) {
      console.log(chalk.red(`Mission UID ${mission.uid}: ${error.message}`));
    } else {
      console.log(
        chalk.red(`Mission UID ${mission.uid}: Unknown error occurred`)
      );
    }
  }
}

async function claimDailyKey(token: string): Promise<void> {
  try {
    const response = await axios.post<{
      header: Header;
      body: { timeDiff: number };
    }>(
      "https://backend.pixelheroes.io/playtomint/dailyClaimKey",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.header.status === 200) {
      console.log(chalk.green("Daily key claimed successfully."));
      // You can use response.data.body.timeDiff if needed
    } else {
      console.log(
        chalk.red("Failed to claim daily key:", response.data.header.message)
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(chalk.red("Error claiming daily key:"), error.message);
    } else if (error instanceof Error) {
      console.error(chalk.red("Error claiming daily key:"), error.message);
    } else {
      console.error(
        chalk.red("Unknown error occurred while claiming daily key")
      );
    }
  }
}

async function processAccount(token: string, index: number): Promise<void> {
  console.log(chalk.blue(`\nProcessing account with token: ${index}`));

  const missions = await fetchMissionList(token);

  if (missions.length === 0) {
    console.log(chalk.yellow("No missions available for this account."));
    return;
  }

  for (const mission of missions) {
    await claimMission(token, mission);
  }

  console.log(chalk.yellow(`\nProcessing Daily Key Claim...`));
  await claimDailyKey(token);
}

async function run(): Promise<void> {
  if (tokens.length === 0) {
    console.error(chalk.red("No bearer tokens found in tokens array."));
    return;
  }

  for (const [index, { TOKEN }] of tokens.entries()) {
    await processAccount(TOKEN, index);
  }
}

run().catch((error) => {
  console.error(chalk.red("An error occurred:"), error);
});
