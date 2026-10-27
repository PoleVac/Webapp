
window.estadisticasGastos = (() => {
    const graficos = new Map();
    const coloresCategorias = {
        "Alimentación": "#E74C3C",
        "Vivienda": "#3498DB",
        "Servicios": "#4e12f3",
        "Transporte": "#2ECC71",
        "Ocio": "#9B59B6",
        "Compras": "#E84393",
        "Salud": "#1ABC9C",
        "Legos": "#795548",
        "Educación": "#34495E",
        "Viajes": "#16A085",
        "Mascotas": "#D35400",
        "Otros": "#7F8C8D",
        "Sin categoría": "#BDC3C7"
    };

    const colorTotal = "#e455e4";

    function obtenerColorCategoria(nombre) {
        return coloresCategorias[nombre] || "#dcf500";
    }

    function inicializar() {
        if (typeof echarts === "undefined") {
            throw new Error("Apache ECharts no está cargado.");
        }
    }

    function obtenerGrafico(id) {
        const elemento = document.getElementById(id);
        if (!elemento) return null;

        let grafico = graficos.get(id);

        if (!grafico || grafico.isDisposed()) {
            grafico = echarts.init(elemento);
            graficos.set(id, grafico);
        }

        return grafico;
    }

    function soles(valor) {
        return Number(valor || 0).toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function renderizar(datos) {
        inicializar();

        for (const persona of datos.personas) {
            const pie = obtenerGrafico(`pie-${persona.index}`);
            const linea = obtenerGrafico(`line-${persona.index}`);

            // GRÁFICO PIE: categorías del mes seleccionado.
            if (pie) {
                pie.setOption({
                    tooltip: {
                        trigger: "item",
                        formatter: p =>
                            `<strong>${p.name}</strong><br/>` +
                            `Total: S/ ${soles(p.value)}<br/>` +
                            `${p.percent}%`
                    },
                    legend: {
                        bottom: 0,
                        type: "scroll"
                    },
                    series: [{
                        name: "Gastos por categoría",
                        type: "pie",
                        radius: ["35%", "65%"],
                        center: ["50%", "43%"],
                        avoidLabelOverlap: true,
                        itemStyle: {
                            borderRadius: 5,
                            borderColor: "#fff",
                            borderWidth: 2
                        },
                        label: {
                            formatter: "{b}\n{d}%"
                        },
                        data: persona.pie.map(g => ({
                            ...g,
                            itemStyle: {
                                color: obtenerColorCategoria(g.name)
                            }
                        }))
                    }],
                    graphic: persona.pie.length
                        ? []
                        : [{
                            type: "text",
                            left: "center",
                            top: "middle",
                            style: {
                                text: "Sin gastos en este mes",
                                fill: "#888",
                                fontSize: 14
                            }
                        }]
                }, true);
            }

            // GRÁFICO DE LÍNEAS: importes diarios y total acumulado.
            if (linea) {
                const series = persona.series.map(s => {
                    const esTotal = s.name === "Total acumulado";

                    // const serie = {
                    //     name: s.name,
                    //     type: "line",
                    //     data: s.data,
                    //     smooth: false,
                    //     showSymbol: true,
                    //     symbolSize: esTotal ? 5 : 6,
                    //     lineStyle: {
                    //         width: esTotal ? 3.5 : 2
                    //     },
                    //     emphasis: {
                    //         focus: "series"
                    //     }
                    // };

                    const serie = {
                        name: s.name,
                        type: "line",
                        data: s.data,
                        smooth: false,
                        showSymbol: true,
                        symbolSize: s.name === "Total acumulado" ? 5 : 6,

                        color: s.name === "Total acumulado"
                            ? colorTotal
                            : obtenerColorCategoria(s.name),

                        lineStyle: {
                            color: s.name === "Total acumulado"
                                ? colorTotal
                                : obtenerColorCategoria(s.name),
                            width: s.name === "Total acumulado" ? 3.5 : 2
                        },

                        itemStyle: {
                            color: s.name === "Total acumulado"
                                ? colorTotal
                                : obtenerColorCategoria(s.name)
                        },

                        emphasis: {
                            focus: "series"
                        }
                    };

                    // Franja vertical para identificar el día de hoy.
                    if (esTotal) {
                        serie.markArea = {
                            silent: true,
                            itemStyle: {
                                color: "rgba(255, 165, 0, 0.16)"
                            },
                            data: [[
                                { xAxis: persona.hoy },
                                {
                                    xAxis: persona.dias[
                                        persona.dias.indexOf(persona.hoy) + 1
                                    ] || persona.hoy
                                }
                            ]]
                        };

                        serie.markLine = {
                            silent: true,
                            symbol: ["none", "none"],
                            lineStyle: {
                                color: "#e67e22",
                                width: 2,
                                type: "dashed"
                            },
                            label: {
                                show: true,
                                formatter: "Hoy",
                                position: "insideEndTop"
                            },
                            data: [{ xAxis: persona.hoy }]
                        };
                    }

                    return serie;
                });

                linea.setOption({
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "line"
                        },
                        formatter: parametros => {
                            if (!parametros.length) return "";

                            const dia = parametros[0].axisValue;
                            const [anio, mes, diaMes] = dia.split("-");
                            const fecha = new Date(
                                Number(anio),
                                Number(mes) - 1,
                                Number(diaMes)
                            );

                            const titulo = fecha.toLocaleDateString("es-PE", {
                                weekday: "short",
                                day: "2-digit",
                                month: "long",
                                year: "numeric"
                            });

                            const valores = parametros.map(p =>
                                `${p.marker}${p.seriesName}: S/ ${soles(p.value)}`
                            ).join("<br/>");

                            const detalles = persona.detalles.filter(g =>
                                g.fecha === dia
                            );

                            const listaGastos = detalles.length
                                ? detalles.map(g =>
                                    `${g.categoria} — ${g.descripcion}: ` +
                                    `S/ ${soles(g.importe)}`
                                ).join("<br/>")
                                : "Sin gastos registrados";

                            return `<strong>${titulo}</strong><br/>` +
                                `${valores}<hr/>` +
                                `<strong>Detalle de gastos</strong><br/>` +
                                `${listaGastos}`;
                        }
                    },

                    legend: {
                        type: "scroll",
                        bottom: 0
                    },

                    grid: {
                        left: 65,
                        right: 25,
                        top: 35,
                        bottom: 105
                    },

                    xAxis: {
                        type: "category",
                        boundaryGap: false,
                        data: persona.dias,
                        axisLabel: {
                            hideOverlap: true,
                            rotate: 45,
                            formatter: valor => {
                                const [, mes, dia] = valor.split("-");
                                return `${dia}/${mes}`;
                            }
                        }
                    },

                    yAxis: {
                        type: "value",
                        name: "S/",
                        axisLabel: {
                            formatter: valor =>
                                Number(valor).toLocaleString("es-PE")
                        }
                    },

                    dataZoom: [
                        {
                            type: "inside",
                            xAxisIndex: 0,
                            filterMode: "filter"
                        },
                        {
                            type: "slider",
                            xAxisIndex: 0,
                            filterMode: "filter",
                            bottom: 35,
                            height: 20
                        }
                    ],

                    series
                }, true);
            }
        }

        for (const grafico of graficos.values()) {
            if (!grafico.isDisposed()) grafico.resize();
        }
    }

    function destruir() {
        for (const grafico of graficos.values()) {
            if (!grafico.isDisposed()) grafico.dispose();
        }

        graficos.clear();
    }

    window.addEventListener("resize", () => {
        for (const grafico of graficos.values()) {
            if (!grafico.isDisposed()) grafico.resize();
        }
    });

    return { inicializar, renderizar, destruir };
})();
