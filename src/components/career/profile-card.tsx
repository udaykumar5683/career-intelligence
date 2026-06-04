'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Languages,
  User,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import type { ResumeProfile, JobRole } from '@/types/analysis'

interface ProfileCardProps {
  profile: ResumeProfile
  roles: JobRole[]
}

export function ProfileCard({ profile, roles }: ProfileCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
            <User className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl">{profile?.name || 'Unknown Candidate'}</CardTitle>
            <CardDescription className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {profile?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </span>
              )}
              {profile?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {profile.phone}
                </span>
              )}
              {profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="max-h-[520px]">
        <CardContent className="space-y-6">
          {/* Comprehensive Summary & Recommendations */}
          <div className="rounded-xl bg-teal-50/50 p-4 border border-teal-100 dark:bg-teal-900/10 dark:border-teal-900/20">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-800 dark:text-teal-300">
              <Sparkles className="h-4 w-4" />
              AI Profile Summary
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              {profile.summary || 'No summary available.'}
            </p>

            {roles?.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-teal-100 dark:border-teal-900/30">
                <h5 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Recommended Roles
                </h5>
                <div className="grid gap-3">
                  {roles.slice(0, 3).map((role, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
                          {role.role}
                        </span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-teal-200 text-teal-700 bg-white">
                          {role.matchScore}% Match
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug italic">
                        {role.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Skills */}
          {profile?.skills?.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/30"
                  >
                    {typeof skill === 'string' ? skill : skill.name || skill.title || `Skill ${idx + 1}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Experience */}
          {profile?.experience?.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Briefcase className="h-4 w-4 text-amber-600" />
                Experience
              </h4>
              <div className="space-y-3">
                {profile.experience.map((exp, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-amber-200 dark:border-amber-800">
                    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-amber-500" />
                    <div className="text-sm font-medium text-foreground">
                      {exp.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {exp.company} &middot; {exp.duration}
                    </div>
                    {exp.description && (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Education */}
          {profile?.education?.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
                Education
              </h4>
              <div className="space-y-2">
                {profile.education.map((edu, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 p-3">
                    <div className="text-sm font-medium text-foreground">
                      {edu.degree}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {edu.institution} &middot; {edu.year}
                    </div>
                    {edu.gpa && (
                      <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                        GPA: {edu.gpa}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Certifications */}
          {profile?.certifications?.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Award className="h-4 w-4 text-orange-500" />
                Certifications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.certifications.map((cert, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400"
                  >
                    {typeof cert === 'string' ? cert : cert.name || cert.title || `Certification ${idx + 1}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {profile?.languages?.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Languages className="h-4 w-4 text-teal-600" />
                Languages
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map((lang, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-teal-300 text-teal-700 dark:border-teal-700 dark:text-teal-400"
                  >
                    {typeof lang === 'string' ? lang : lang.name || lang.title || `Language ${idx + 1}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {profile?.projects?.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Projects
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.projects.map((proj, idx) => (
                  <Badge key={idx} variant="secondary">
                    {typeof proj === 'string' ? proj : proj.name || proj.title || `Project ${idx + 1}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
