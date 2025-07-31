"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        // Floating particles animation
        const particles: Array<{
            x: number
            y: number
            size: number
            speedX: number
            speedY: number
            opacity: number
        }> = []

        // Floating books animation
        const books: Array<{
            x: number
            y: number
            width: number
            height: number
            speedX: number
            speedY: number
            angle: number
            rotationSpeed: number
            opacity: number
            color: string
        }> = []

        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.1,
            })
        }

        // Create floating books
        for (let i = 0; i < 8; i++) {
            books.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                width: Math.random() * 32 + 24,
                height: Math.random() * 18 + 12,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                angle: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
                opacity: Math.random() * 0.3 + 0.2,
                color: ["#fbbf24", "#f87171", "#60a5fa", "#a78bfa", "#34d399", "#f472b6", "#facc15", "#38bdf8"][i % 8],
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw particles
            particles.forEach((particle, index) => {
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
                ctx.fill()

                // Update particle position
                particle.x += particle.speedX
                particle.y += particle.speedY

                // Wrap around screen
                if (particle.x > canvas.width) particle.x = 0
                if (particle.x < 0) particle.x = canvas.width
                if (particle.y > canvas.height) particle.y = 0
                if (particle.y < 0) particle.y = canvas.height

                // Connect nearby particles
                particles.slice(index + 1).forEach((otherParticle) => {
                    const dx = particle.x - otherParticle.x
                    const dy = particle.y - otherParticle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 100) {
                        ctx.beginPath()
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(otherParticle.x, otherParticle.y)
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                })
            })

            // Draw floating books
            books.forEach((book) => {
                ctx.save()
                ctx.globalAlpha = book.opacity
                ctx.translate(book.x + book.width / 2, book.y + book.height / 2)
                ctx.rotate(book.angle)
                ctx.fillStyle = book.color
                ctx.fillRect(-book.width / 2, -book.height / 2, book.width, book.height)
                // Draw a "spine"
                ctx.fillStyle = "rgba(0,0,0,0.15)"
                ctx.fillRect(-book.width / 2, -book.height / 2, 6, book.height)
                // Draw a "pages" line
                ctx.strokeStyle = "rgba(255,255,255,0.2)"
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.moveTo(-book.width / 2 + 6, -book.height / 2 + 2)
                ctx.lineTo(book.width / 2 - 2, -book.height / 2 + 2)
                ctx.stroke()
                ctx.restore()

                // Update book position and rotation
                book.x += book.speedX
                book.y += book.speedY
                book.angle += book.rotationSpeed

                // Wrap around screen
                if (book.x > canvas.width) book.x = 0
                if (book.x < 0) book.x = canvas.width
                if (book.y > canvas.height) book.y = 0
                if (book.y < 0) book.y = canvas.height
            })

            requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener("resize", resizeCanvas)
        }
    }, [])

    return (
        <>
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" />

            {/* Animated Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />

            {/* Additional gradient overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/20" />
        </>
    )
}
