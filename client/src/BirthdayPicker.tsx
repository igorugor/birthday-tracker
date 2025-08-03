/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState } from 'react';

const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

interface BirthdayPickerProps {
	dayFrom: number | null;
	monthFrom: number | null;
	dayTo: number | null;
	monthTo: number | null;

	onDayFromChange?: (value: number) => void;
	onMonthFromChange?: (value: number) => void;
	onDayToChange?: (value: number) => void;
	onMonthToChange?: (value: number) => void;
}

export const BirthdayPicker: React.FC<BirthdayPickerProps> = ({
	dayFrom,
	dayTo,
	monthFrom,
	monthTo,
	onDayFromChange,
	onDayToChange,
	onMonthFromChange,
	onMonthToChange,
}) => {
	const [dayFromLocal, setDayFromLocal] = useState<number | null>(null);
	const [monthFromLocal, setMonthFromLocal] = useState<number | null>(null);

	const [dayToLocal, setDayToLocal] = useState<number | null>(null);
	const [monthToLocal, setMonthToLocal] = useState<number | null>(null);

	return (
		<>
			<div className="flex gap-2">
				<label>Период с</label>
				<select
					value={dayFrom ?? dayFromLocal ?? ''}
					onChange={(e) => {
						setDayFromLocal(Number(e.target.value) || null);
						onDayFromChange && onDayFromChange(Number(e.target.value));
					}}
				>
					<option value="">Day</option>
					{days.map((d) => (
						<option key={d} value={d}>
							{d}
						</option>
					))}
				</select>

				<select
					value={monthFrom ?? monthFromLocal ?? ''}
					onChange={(e) => {
						setMonthFromLocal(Number(e.target.value) || null);
						onMonthFromChange && onMonthFromChange(Number(e.target.value));
					}}
				>
					<option value="">Month</option>
					{months.map((m) => (
						<option key={m} value={m}>
							{m}
						</option>
					))}
				</select>
			</div>

			<div className="flex gap-2">
				<label>Период до</label>
				<select
					value={dayTo ?? dayToLocal ?? ''}
					onChange={(e) => {
						setDayToLocal(Number(e.target.value) || null);
						onDayToChange && onDayToChange(Number(e.target.value));
					}}
				>
					<option value="">Day</option>
					{days.map((d) => (
						<option key={d} value={d}>
							{d}
						</option>
					))}
				</select>

				<select
					value={monthTo ?? monthToLocal ?? ''}
					onChange={(e) => {
						setMonthToLocal(Number(e.target.value) || null);
						onMonthToChange && onMonthToChange(Number(e.target.value));
					}}
				>
					<option value="">Month</option>
					{months.map((m) => (
						<option key={m} value={m}>
							{m}
						</option>
					))}
				</select>
			</div>
		</>
	);
};
