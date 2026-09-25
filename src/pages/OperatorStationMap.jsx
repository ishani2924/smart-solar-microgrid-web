import StationMap from '../components/StationMap';

export default function OperatorStationMap() {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900">Station map</h1>
        <p className="text-sm text-gray-500 mt-1">Every microgrid station is plotted from the latitude and longitude saved on that station.</p>
      </div>
      <StationMap />
    </div>
  );
}
