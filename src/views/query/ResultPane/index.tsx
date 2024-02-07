import { ActionIcon, Center, Divider, Group, Pagination, Stack, Text } from "@mantine/core";
import { mdiClock, mdiDatabase, mdiLightningBolt } from "@mdi/js";
import { useActiveSession } from "~/hooks/environment";
import { useIsLight } from "~/hooks/theme";
import { useState } from "react";
import { useLayoutEffect } from "react";
import { useStable } from "~/hooks/stable";
import { Icon } from "~/components/Icon";
import { Panel } from "~/components/Panel";
import { DataTable } from "~/components/DataTable";
import { RESULT_LISTINGS } from "~/constants";
import { CombinedJsonPreview, SingleJsonPreview } from "./preview";
import { useConfigStore } from "~/stores/config";

function computeRowCount(response: any) {
	if (!response) {
		return 0;
	}

	// We can count an array, otherwise it's always 1 result (unless there is an error, in which case there is no result :D) 
	if (Array.isArray(response.result)) {
		return response.result.length;
	}

	return response.status == "ERR" ? 0 : 1;
}

export function ResultPane() {
	const isLight = useIsLight();
	const activeSession = useActiveSession();
	const [resultTab, setResultTab] = useState<number>(1);
	const resultListing = useConfigStore((s) => s.resultListing);
	const setResultListingMode = useConfigStore((s) => s.setResultListingMode);
	const responses: any[] = activeSession?.lastResponse || [];
	const response = responses[resultTab - 1];

	const responseCount = responses.length;
	const rowCount = computeRowCount(response);
	
	const showCombined = resultListing == 'combined';
	const showTabs = !showCombined && responses.length > 1;
	const showResponses = showCombined && responseCount > 0;
	const showRows = response?.result?.length > 0;
	const showTime = response?.time && !showCombined;
	const showDivider = (showCombined ? showResponses : showRows) || showTime;

	useLayoutEffect(() => {
		setResultTab(1);
	}, [responses.length]);

	const setResultView = useStable(setResultListingMode);

	return (
		<Panel
			title={showCombined ? 'Results' : showTabs ? `Result #${resultTab}` : "Result"}
			icon={mdiLightningBolt}
			rightSection={
				<Group align="center">
					{response?.result !== undefined && (
						<>
							{RESULT_LISTINGS.map(item => {
								const isActive = item.id == resultListing;

								return (
									<ActionIcon
										key={item.id}
										onClick={() => setResultView(item.id)}
										color={isActive ? 'surreal' : 'light.4'}
										title={`Switch to ${item.id} view`}
									>
										<Icon
											color={isActive ? 'surreal' : undefined}
											path={item.icon}
										/>
									</ActionIcon>
								);
							})}

							{showDivider && (
								<Divider
									orientation="vertical"
									color={isLight ? 'light.0' : 'dark.5'}
								/>
							)}
						</>
					)}

					{showResponses ? (
						<>
							<Icon color="light.4" path={mdiDatabase} mr={-10} />
							<Text c="light.4" lineClamp={1}>
								{responseCount} {responseCount == 1 ? 'result' : 'results'}
							</Text>
						</>
					) : showRows && (
						<>
							<Icon color="light.4" path={mdiDatabase} mr={-10} />
							<Text c="light.4" lineClamp={1}>
								{rowCount} {rowCount == 1 ? 'row' : 'rows'}
							</Text>
						</>
					)}

					{showTime && (
						<>
							<Icon color="light.4" path={mdiClock} mr={-10} />
							<Text c="light.4" lineClamp={1}>
								{response.time}
							</Text>
						</>
					)}
				</Group>
			}>
			<div
				style={{
					position: "absolute",
					insetInline: 14,
					top: 0,
					bottom: showTabs ? 72 : 0,
				}}>
				{response ? (
					<>
						{resultListing == "combined" ? (
							<CombinedJsonPreview results={responses} />
						) : response.status == "ERR" ? (
							<Text 
								color="red" 
								style={{
									whiteSpace: "pre-wrap",
									fontFamily: "monospace",
								}}
							>
								{response.result}
							</Text>
						) : response.result?.length === 0 ? (
							<Text c="light.4">No results found for query</Text>
						) : resultListing == "table" ? (
							<DataTable data={response.result} />
						) : (
							<SingleJsonPreview result={response.result} />
						)}
					</>
				) : (
					<Center h="100%" c="light.5">
						<Stack>
							<Icon
								path={mdiLightningBolt}
								mx="auto"
								size="lg"
							/>
							Execute a query to view the results here
						</Stack>
					</Center>
				)}
			</div>

			{showTabs && (
				<Stack
					gap="xs"
					align="center"
					style={{
						position: "absolute",
						insetInline: 14,
						bottom: 12,
					}}>
					<Divider w="100%" color={isLight ? "light.0" : "dark.5"} />
					<Pagination total={responses.length} value={resultTab} onChange={setResultTab} />
				</Stack>
			)}
		</Panel>
	);
}
