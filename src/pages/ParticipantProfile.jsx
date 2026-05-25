import { motion } from "framer-motion";

import {
    Activity,
    ArrowLeft,
    Calendar,
    MapPin,
    Medal,
    ShieldCheck,
    Timer,
    Trophy,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function ParticipantProfile() {

  const navigate = useNavigate();

  const history = [

    {
      id: 1,
      competition: "Velocity League",
      date: "10 Mayo 2026",
      time: "2.19s",
      position: "1°",
    },

    {
      id: 2,
      competition: "Sprint Cup",
      date: "04 Mayo 2026",
      time: "2.28s",
      position: "2°",
    },

    {
      id: 3,
      competition: "RunTimer Open",
      date: "27 Abril 2026",
      time: "2.31s",
      position: "1°",
    },

  ];

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-black text-white p-6 md:p-10"
    >

      {/* TOP BAR */}
      <div className="flex items-center gap-4 mb-10">

        <button
          onClick={() => navigate(-1)}
          className="
            w-14
            h-14
            rounded-2xl
            bg-zinc-900
            border
            border-zinc-800
            flex
            items-center
            justify-center
            hover:bg-zinc-800
            transition
          "
        >

          <ArrowLeft />

        </button>

        <div>

          <h1 className="text-4xl font-bold">
            Perfil del participante
          </h1>

          <p className="text-gray-400 mt-2">
            Información general y estadísticas.
          </p>

        </div>

      </div>

      {/* HERO CARD */}
      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-[32px]
          overflow-hidden
          mb-10
        "
      >

        {/* TOP */}
        <div
          className="
            bg-gradient-to-r
            from-red-500
            to-red-700
            p-10
          "
        >

          <div
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-center
              gap-8
            "
          >

            {/* AVATAR */}
            <div
              className="
                w-36
                h-36
                rounded-full
                bg-white/20
                flex
                items-center
                justify-center
                text-5xl
                font-bold
                backdrop-blur-md
              "
            >
              VX
            </div>

            {/* INFO */}
            <div className="flex-1">

              <h1 className="text-5xl font-bold mb-4">
                Velocity X
              </h1>

              <div
                className="
                  flex
                  flex-wrap
                  gap-5
                  text-white/80
                "
              >

                <div className="flex items-center gap-2">

                  <ShieldCheck size={18} />

                  Profesional

                </div>

                <div className="flex items-center gap-2">

                  <MapPin size={18} />

                  Bogotá, Colombia

                </div>

                <div className="flex items-center gap-2">

                  <Calendar size={18} />

                  21 años

                </div>

              </div>

            </div>

            {/* STATUS */}
            <div
              className="
                bg-green-500/20
                border
                border-green-400/20
                px-6
                py-4
                rounded-2xl
                text-green-300
                font-bold
                h-fit
              "
            >
              ACTIVO
            </div>

          </div>

        </div>

        {/* BODY */}
        <div className="p-8">

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4
              gap-6
            "
          >

            {/* CARD */}
            <div
              className="
                bg-zinc-800
                rounded-3xl
                p-6
              "
            >

              <div className="flex justify-between mb-5">

                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-red-500/20
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Timer className="text-red-400" />
                </div>

              </div>

              <p className="text-gray-400 mb-2">
                Mejor tiempo
              </p>

              <h2 className="text-4xl font-bold">
                2.19s
              </h2>

            </div>

            {/* CARD */}
            <div
              className="
                bg-zinc-800
                rounded-3xl
                p-6
              "
            >

              <div className="flex justify-between mb-5">

                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-yellow-500/20
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Trophy className="text-yellow-400" />
                </div>

              </div>

              <p className="text-gray-400 mb-2">
                Victorias
              </p>

              <h2 className="text-4xl font-bold">
                8
              </h2>

            </div>

            {/* CARD */}
            <div
              className="
                bg-zinc-800
                rounded-3xl
                p-6
              "
            >

              <div className="flex justify-between mb-5">

                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-blue-500/20
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Activity className="text-blue-400" />
                </div>

              </div>

              <p className="text-gray-400 mb-2">
                Competencias
              </p>

              <h2 className="text-4xl font-bold">
                14
              </h2>

            </div>

            {/* CARD */}
            <div
              className="
                bg-zinc-800
                rounded-3xl
                p-6
              "
            >

              <div className="flex justify-between mb-5">

                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-green-500/20
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Medal className="text-green-400" />
                </div>

              </div>

              <p className="text-gray-400 mb-2">
                Ranking global
              </p>

              <h2 className="text-4xl font-bold">
                #2
              </h2>

            </div>

          </div>

        </div>

      </div>

      {/* BADGES */}
      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-8
          mb-10
        "
      >

        <h2 className="text-3xl font-bold mb-8">
          Logros
        </h2>

        <div className="flex flex-wrap gap-5">

          <div
            className="
              bg-yellow-500/20
              text-yellow-400
              px-6
              py-4
              rounded-2xl
              font-semibold
            "
          >
            🏆 Campeón regional
          </div>

          <div
            className="
              bg-green-500/20
              text-green-400
              px-6
              py-4
              rounded-2xl
              font-semibold
            "
          >
            ⚡ Récord sub 2.20s
          </div>

          <div
            className="
              bg-red-500/20
              text-red-400
              px-6
              py-4
              rounded-2xl
              font-semibold
            "
          >
            🔥 5 victorias consecutivas
          </div>

        </div>

      </div>

      {/* HISTORY */}
      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-8
        "
      >

        <div className="mb-8">

          <h2 className="text-3xl font-bold mb-2">
            Historial reciente
          </h2>

          <p className="text-gray-400">
            Últimos resultados registrados.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead>

              <tr className="border-b border-zinc-800 text-left text-gray-400">

                <th className="pb-5">
                  Competencia
                </th>

                <th className="pb-5">
                  Fecha
                </th>

                <th className="pb-5">
                  Tiempo
                </th>

                <th className="pb-5">
                  Posición
                </th>

              </tr>

            </thead>

            <tbody>

              {
                history.map((item) => (

                  <tr
                    key={item.id}
                    className="
                      border-b
                      border-zinc-800
                      hover:bg-zinc-800/40
                      transition
                    "
                  >

                    <td className="py-6 font-semibold">
                      {item.competition}
                    </td>

                    <td className="py-6 text-gray-400">
                      {item.date}
                    </td>

                    <td className="py-6 font-bold text-green-400">
                      {item.time}
                    </td>

                    <td className="py-6">
                      {item.position}
                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>

        </div>

      </div>

    </motion.div>

  );
}

export default ParticipantProfile;